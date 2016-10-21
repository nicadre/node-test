// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   passport.js                                        :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: niccheva <niccheva@student.42.fr>          +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2016/10/21 12:04:20 by niccheva          #+#    #+#             //
//   Updated: 2016/10/21 14:16:50 by niccheva         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

var JwtStrategy = require('passport-jwt').Strategy;

var User = require('../app/models/user');
var config = require('../config/database');

module.exports = function(passport) {

	var opts = {};
	opts.secretOrKey = config.secret;
	passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
		User.findOne({ id: jwt_payload.id}, function(err, user) {

			if (err) {
				return done(err, false);
			}
			if (user) {
				done(null, user);
			} else {
				done(null, false);
			}

		});
	}));

};
