import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Stripe "stripe/stripe";

module {
  type OldProduct = {
    id : Nat;
    name : Text;
    category : Text;
    price : Float;
    description : Text;
    reviews : [Text];
    imageData : ?Text;
  };

  type NewProduct = {
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

  type UserProfile = {
    name : Text;
    email : Text;
    shippingAddress : Text;
  };

  type OldActor = {
    productId : Nat;
    stripeConfig : ?Stripe.StripeConfiguration;
    productsMap : Map.Map<Nat, OldProduct>;
    cartMap : Map.Map<Principal, List.List<CartItem>>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  type NewActor = {
    runningProductId : Nat;
    stripeConfiguration : ?Stripe.StripeConfiguration;
    productsState : Map.Map<Nat, NewProduct>;
    cartState : Map.Map<Principal, List.List<CartItem>>;
    userProfileState : Map.Map<Principal, UserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let newProducts = old.productsMap.map<Nat, OldProduct, NewProduct>(
      func(_id, oldProduct) {
        {
          id = oldProduct.id;
          name = oldProduct.name;
          category = oldProduct.category;
          price = oldProduct.price;
          description = oldProduct.description;
          imageData = oldProduct.imageData;
        };
      }
    );
    {
      runningProductId = old.productId;
      stripeConfiguration = old.stripeConfig;
      productsState = newProducts;
      cartState = old.cartMap;
      userProfileState = old.userProfiles;
    };
  };
};
