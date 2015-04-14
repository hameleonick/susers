/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/


module.exports = {

    schema: true,

    attributes:{
        name:{
            type: "string",
            required: true
        },

        title:{
            type: "string"
        },

        email:{
            type: "string",
            required: true,
            email: true,
            unique: true
        },

        admin:{
            type: "boolean",
            defaultsTo: false

        },

        encryptedPassword:{
            type: "string"
        },

        toJSON: function(){
            var obj = this.toObject();
            delete obj.password;
            delete obj.encryptedPassword;
            delete obj.confirmation;
            delete obj._csrf;

            return obj;
        }

    },


    findOneByEmail: function(email, callback){
        this.findOne({"email":email}, function findByEmail(err, user){

        });
    },

    beforeValidation:function(values, next){
        console.log(values.admin)
        if(typeof values.admin !== 'undefined'){
            if(values.admin){
                values.admin = true;
            } else{
                values.admin = false;
            }
        }

        next();
    },

    beforeCreate: function(values, next){

        console.log("beforeCreate")
        if(!values.password || values.password != values.confirmation){
            return next({err:["Password doesn't match password confirmation"]})
        }

        var bcrypt = require('bcrypt-nodejs');

        bcrypt.hash(values.password, null, null, function(err, encryptedPassword) {
            // Store hash in your password DB.
            if(err) return next(err);
            values.encryptedPassword = encryptedPassword;
            values.online = true;
            next();
        });

    }
};
