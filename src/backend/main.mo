import Array "mo:core/Array";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
    email : Text;
    shippingAddress : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product Types
  type Product = {
    id : Nat;
    name : Text;
    category : Text;
    price : Float;
    description : Text;
    reviews : [Text];
    imageData : ?Text;
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  let productsMap = Map.empty<Nat, Product>();
  let cartMap = Map.empty<Principal, List.List<CartItem>>();
  var productId = 0;

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // Admin-only: Add Product
  public shared ({ caller }) func addProduct(name : Text, category : Text, price : Float, description : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    let product : Product = {
      id = productId;
      name;
      category;
      price;
      description;
      reviews = [];
      imageData = null;
    };
    productsMap.add(productId, product);
    productId += 1;
    product.id;
  };

  // Users only: Add Review
  public shared ({ caller }) func addReview(productId : Nat, review : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add reviews");
    };
    switch (productsMap.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let updatedProduct = {
          product with reviews = product.reviews.concat([review]);
        };
        productsMap.add(productId, updatedProduct);
      };
    };
  };

  // Users only: Add to Cart
  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add items to cart");
    };
    let currentCart = switch (cartMap.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?items) { items };
    };
    currentCart.add({ productId; quantity });
    cartMap.add(caller, currentCart);
  };

  // Users only: Update Cart Quantity
  public shared ({ caller }) func updateCartQuantity(productId : Nat, newQuantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update cart");
    };
    let currentCart = switch (cartMap.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?items) { items };
    };

    let updatedCart = currentCart.map<CartItem, CartItem>(
      func(item) {
        if (item.productId == productId) {
          { item with quantity = newQuantity };
        } else {
          item;
        };
      }
    );

    cartMap.add(caller, updatedCart);
  };

  // Users only: View Cart
  public query ({ caller }) func viewCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };
    switch (cartMap.get(caller)) {
      case (null) { [] };
      case (?items) { items.toArray() };
    };
  };

  // Users only: Calculate Total
  public query ({ caller }) func calculateTotal() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can calculate cart total");
    };
    var total : Float = 0.0;
    switch (cartMap.get(caller)) {
      case (null) { return total };
      case (?items) {
        for (item in items.values()) {
          switch (productsMap.get(item.productId)) {
            case (null) {};
            case (?product) {
              total += product.price * item.quantity.toFloat();
            };
          };
        };
      };
    };
    total;
  };

  // Admin-only: Upload Product Image
  public shared ({ caller }) func uploadProductImage(productId : Nat, imageData : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can upload product images");
    };
    switch (productsMap.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let updatedProduct = {
          product with imageData = ?imageData;
        };
        productsMap.add(productId, updatedProduct);
      };
    };
  };

  // Public: Search Products (no authentication required)
  public query func searchProducts(searchTerm : Text) : async [Product] {
    productsMap.values().toArray().filter(
      func(product) {
        product.name.contains(#text searchTerm) or product.description.contains(#text searchTerm);
      }
    ).sort();
  };

  // Admin-only: Set Stripe Configuration
  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfig := ?config;
  };

  // Users only: Create Stripe Checkout Session
  public shared ({ caller }) func createStripeSession(successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    let items = switch (cartMap.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?cartItems) {
        cartItems.toArray().map(
          func(cartItem) {
            let product = switch (productsMap.get(cartItem.productId)) {
              case (null) { Runtime.trap("Product not found") };
              case (?p) { p };
            };
            {
              currency = "usd";
              productName = product.name;
              productDescription = product.description;
              priceInCents = (product.price * 100.0).toInt().toNat();
              quantity = cartItem.quantity;
            };
          }
        );
      };
    };

    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe must be configured first") };
      case (?config) {
        await Stripe.createCheckoutSession(config, caller, items, successUrl, cancelUrl, transform);
      };
    };
  };

  // Public: Transform function for HTTP outcalls
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Stripe Integration Component
  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    let config = switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe must be configured first") };
      case (?config) { config };
    };
    await Stripe.createCheckoutSession(config, caller, items, successUrl, cancelUrl, transform);
  };
  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    let config = switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe must be configured first") };
      case (?config) { config };
    };
    await Stripe.getSessionStatus(config, sessionId, transform);
  };
};
