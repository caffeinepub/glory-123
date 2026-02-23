import Array "mo:core/Array";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import Nat "mo:core/Nat";

actor {
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

  type PaymentMethod = {
    #cashOnDelivery;
    #upi : Text;
  };

  let productsMap = Map.empty<Nat, Product>();
  let cartMap = Map.empty<Principal, List.List<CartItem>>();
  var nextProductId = 0;

  public shared ({ caller }) func addProduct(name : Text, category : Text, price : Float, description : Text) : async Nat {
    let product : Product = {
      id = nextProductId;
      name;
      category;
      price;
      description;
      reviews = [];
      imageData = null;
    };
    productsMap.add(nextProductId, product);
    nextProductId += 1;
    product.id;
  };

  public shared ({ caller }) func addReview(productId : Nat, review : Text) : async () {
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

  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    let currentCart = switch (cartMap.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?items) { items };
    };
    currentCart.add({ productId; quantity });
    cartMap.add(caller, currentCart);
  };

  public query ({ caller }) func viewCart() : async [CartItem] {
    switch (cartMap.get(caller)) {
      case (null) { [] };
      case (?items) { items.toArray() };
    };
  };

  public query ({ caller }) func calculateTotal() : async Float {
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

  public shared ({ caller }) func checkout(paymentMethod : PaymentMethod) : async Text {
    switch (paymentMethod) {
      case (#cashOnDelivery) { "Order placed with Cash on Delivery" };
      case (#upi(upiId)) {
        "Order placed with UPI payment to " # upiId;
      };
    };
  };

  public shared ({ caller }) func uploadProductImage(productId : Nat, imageData : Text) : async () {
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

  public query func searchProducts(searchTerm : Text) : async [Product] {
    productsMap.values().toArray().filter(
      func(product) {
        product.name.contains(#text searchTerm) or product.description.contains(#text searchTerm);
      }
    ).sort();
  };
};
