// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   server.js                                          :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: niccheva <niccheva@student.42.fr>          +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2016/10/21 11:48:35 by niccheva          #+#    #+#             //
//   Updated: 2016/10/21 15:00:56 by niccheva         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport	= require('passport');
var config      = require('./config/database');
var User        = require('./app/models/user');
var port        = process.env.PORT || 8080;
var jwt         = require('jwt-simple');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));
app.use(passport.initialize());

app.get('/', function(req, res) {

	res.send('Hello! The API is at http://localhost:' + port + '/api');

});

app.listen(port);
console.log('There will be dragons: http://localhost:' + port);

mongoose.connect(config.database);

require('./config/passport')(passport);

var apiRoutes = express.Router();

apiRoutes.post('/signup', function(req, res) {

	console.log(req.body);
	var user = req.body.user;
	if (!user.name || !user.password) {
		res.json({ sucess: false, msg: 'Please pass name and password.' });
	} else {

		var newUser = new User(user);

		newUser.save(function(err) {
			if (err) {
				console.log(err);
				return res.json({ success: false, msg: "Username already exists."});
			}
			res.json({ success: true, msg: "Successful created new user." });
		});
	}

});

apiRoutes.post('/authenticate', function(req, res) {
	User.findOne({
		name: req.body.name
	}, function(err, user) {
		if (err) throw err;
		if (!user) {
			res.send({success: false, msg: 'Authentication failed. User not found.'});
		} else {
			user.comparePassword(req.body.password, function (err, isMatch) {
				if (isMatch && !err) {
					var token = jwt.encode(user, config.secret);
					res.json({success: true, token: 'JWT ' + token});
				} else {
					res.send({success: false, msg: 'Authentication failed. Wrong password.'});
				}
			});
		}
	});
});

apiRoutes.get('/memberinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
	var token = getToken(req.headers);
	if (token) {
		var decoded = jwt.decode(token, config.secret);
		User.findOne({
			name: decoded.name
		}, function(err, user) {
			if (err) throw err;

			if (!user) {
				return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
			} else {
				res.json({success: true, msg: 'Welcome in the member area ' + user.name + '!'});
			}
		});
	} else {
		return res.status(403).send({success: false, msg: 'No token provided.'});
	}
});

getToken = function (headers) {
	if (headers && headers.authorization) {
		var parted = headers.authorization.split(' ');
		if (parted.length === 2) {
			return parted[1];
		} else {
			return null;
		}
	} else {
		return null;
	}
};


apiRoutes.get('/all', function (req, res) {
	User.find(function(err, users) {
		if (err) {
			throw err;
		}
		res.json(users);
	});
});

app.use('/api', apiRoutes);
