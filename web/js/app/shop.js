$(document).ready(function(){
    var Product = Backbone.Model.extend({});

    var ProductList = Backbone.Collection.extend({
        model: Product,
        url: "js/app/catalog.json"
    });

    var Catalog = new ProductList;

    var ProductView = Backbone.View.extend({

        tagName:  "li",
        template: _.template($('#product-template').html()),

        initialize: function () {
            this.$el.draggable({helper: "clone"});
            this.$el.bind('dragstart', _.bind(this.dragStart, this));
            this.$el.bind('dragstop', _.bind(this.dragStop, this));
        },

        dragStart: function(e){
            window.productToCart = this.model;
        },

        dragStop: function(e){
            window.productToCart = null;
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    var ProductInCartView = Backbone.View.extend({
        tagName:  "li",
        template: _.template($('#product-in-cart-template').html()),

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    var Cart = Backbone.Collection.extend({
        model: Product,

        getAmount: function() {
            var amount = 0;
            _.each(this.models, function(product, key){
                amount = amount + parseInt(product.get('price'));
            });
            return amount;
        }
    });

    var productsInCart = new Cart;

    var CartView = Backbone.View.extend({

        el: $("#cart"),

        initialize: function () {
            this.$el.droppable();
            this.$el.bind('drop', _.bind(this.drop, this));
        },

        drop: function(e){
            product = window.productToCart;
            this.model.add(product);
        },

        hideEmptyMsg: function(){
            this.$el.find('.empty').hide();
        }

    });

    var CartTotalView = Backbone.View.extend({
        el: $(".total"),

        updateAmount: function(){
            this.$el.find('.amount').text(
                productsInCart.getAmount()
            );
        },

        show: function(){
            this.$el.show();
        }
    });

    var AppView = Backbone.View.extend({

        el: $("#shop"),

        initialize: function(){

            this.cart = new CartView({
                model: productsInCart
            });
            this.cartTotal = new CartTotalView;

            this.listenTo(Catalog, 'add', this.showProduct);
            this.listenTo(productsInCart, 'add', this.addToCart);

            Catalog.fetch();
        },

        showProduct: function(product) {
            var view = new ProductView({model: product});
            this.$("#products").append(view.render().el);
        },

        addToCart: function(product) {
            var view = new ProductInCartView({model: product});
            this.cart.hideEmptyMsg();
            this.cartTotal.show();
            this.$("#cart-items").append(view.render().el);
            this.cartTotal.updateAmount();
        }
    });

    var App = new AppView;
});