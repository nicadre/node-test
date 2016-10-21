// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   user.js                                            :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: niccheva <niccheva@student.42.fr>          +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2016/10/21 11:55:25 by niccheva          #+#    #+#             //
//   Updated: 2016/10/21 12:03:09 by niccheva         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var UserSchema = new Schema({
	name : {
		type: String,
		unique: true,
		required: true
	},
	password: {
		type: String,
		required: true
	}
});

UserSchema.pre('save', function(next) {

	var user = this;
	if (this.isModified('password') || this.isNew) {
		bcrypt.genSalt(10, function (err, salt) {

			if (err) {
				return next(err);
			}
			bcrypt.hash(user.password, salt, function (err, hash) {

				if (err) {
					return next(err);
				}
				user.password = hash;
				next();

			});
		});
	} else {
		return next();
	}

});

UserSchema.methods.comparePassword = function(passw, cb) {

	bcrypt.compare(passw, this.password, function (err, isMatch) {

		if (err) {
			return cb(err);
		}
		cb(null, isMatch);

	});

};

module.exports = mongoose.model('User', UserSchema);
