import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Principal "mo:core/Principal";
import Float "mo:core/Float";
import List "mo:core/List";
import Order "mo:core/Order";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Actor fields with persistent state.
  var runningProductId = 0;
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;
  let productsState = Map.empty<Nat, Product>();
  let cartState = Map.empty<Principal, List.List<CartItem>>();
  let userProfileState = Map.empty<Principal, UserProfile>();

  // Authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Product = {
    id : Nat;
    name : Text;
    category : Text;
    price : Float;
    description : Text;
    imageData : ?Text;
  };

  type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    shippingAddress : Text;
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      if (p1.category != p2.category) {
        Text.compare(p1.category, p2.category);
      } else {
        Nat.compare(p1.id, p2.id);
      };
    };
  };

  public shared ({ caller }) func addProduct(name : Text, category : Text, price : Float, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    let product : Product = {
      id = runningProductId;
      name;
      category;
      price;
      description;
      imageData = null;
    };

    productsState.add(runningProductId, product);
    runningProductId += 1;
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    switch (cartState.get(caller)) {
      case (null) { [] };
      case (?cartItems) { cartItems.toArray() };
    };
  };

  public shared ({ caller }) func updateCart(productId : Nat, newQuantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update cart");
    };

    let currentCart = switch (cartState.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?cartItems) { cartItems };
    };

    let existingItem = currentCart.find(func(item) { item.productId == productId });
    switch (existingItem) {
      case (null) {
        if (newQuantity > 0) {
          currentCart.add({ productId; quantity = newQuantity });
        };
      };
      case (?_item) {
        if (newQuantity == 0) {
          let itemsToKeep = currentCart.filter(func(cartItem) { cartItem.productId != productId });
          cartState.add(caller, itemsToKeep);
        } else {
          let updatedCart = currentCart.map<CartItem, CartItem>(
            func(cartItem) {
              if (cartItem.productId == productId) {
                { cartItem with quantity = newQuantity };
              } else {
                cartItem;
              };
            }
          );
          cartState.add(caller, updatedCart);
        };
      };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };
    cartState.remove(caller);
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfiguration := ?config;
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?config) { config };
    };
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public query func getProducts() : async [Product] {
    productsState.values().toArray();
  };

  public query func getAllProducts() : async [Product] {
    productsState.values().toArray();
  };

  public shared ({ caller }) func setUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set profiles");
    };
    userProfileState.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfileState.get(user);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfileState.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfileState.add(caller, profile);
  };
};
