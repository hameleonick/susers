/**
 * SessionController
 *
 * @description :: Server-side logic for managing sessions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var bcrypt = require('bcrypt-nodejs');
module.exports = {
	'new':function(req, res){

        res.view('session/new')

    },

    create: function(req, res, next){
        if(!req.param('email') || !req.param('password')){

            var usernamePasswordRequiredError = [{name: 'usernamePasswordRequired', message: 'You must enter both a username and password'}];

            req.session.flash = {
                err: usernamePasswordRequiredError
            }

            res.redirect('/session/new');
            return;
        }

        User.findOne({"email":req.param('email')}, function findByEmail(err, user){

            if(err) return next(err);

            if(!user){
                var noAccountError = [{name:'noAccount', message:'The email address '+req.param('email')+' not found.'}];

                req.session.flash = {
                    err:noAccountError
                }

                res.redirect('/session/new');

                return;
            }

            bcrypt.compare(req.param('password'), user.encryptedPassword, function(err, valid){
                if(err) return next(err);

                if(!valid){
                    var usernamePasswordMismatchError = [{name:'usernamePasswordMismatch', message:'Invalid username and password combination'}];
                    req.session.flash = {
                        err:usernamePasswordMismatchError
                    }

                    res.redirect('/session/new');

                    return;
                }

                req.session.authenticated = true;
                req.session.User = user;

                user.online = true;

                User.publishUpdate(user.id, {
                   loggedIn: true,
                   id: user.id
                });

                user.save(function(err, user){
                    if(err) return next(err);

                    if(req.session.User.admin){
                        res.redirect('/user');
                        return;
                    }

                    res.redirect('/user/show/'+user.id);
                });

            });
        });


    },

    destroy: function(req, res, next){


        if(!req.session.User && !req.session.User.id)
            res.redirect('/session/new');

        User.findOne(req.session.User.id, function foundUser(err, user){
            if(err) return next(err);

            var userId = req.session.User.id;
            console.log(user)
            user.online = false;

            User.publishUpdate(user.id, {
                loggedIn: false,
                id: user.id
            });

            user.save(function(err, user){
                if(err) return next(err);
                console.log(user)
                req.session.destroy();
                res.redirect('/session/new');
            });

        });


    }
};

