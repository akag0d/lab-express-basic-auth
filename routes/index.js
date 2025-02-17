const router = require("express").Router();
const bcrypt = require('bcryptjs')
const User = require('../models/User.model.js')

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
  res.render("signup");
});


router.post('/signup', (req, res, next) => {
	const { username, password } = req.body
	if (password.length < 4) {
		res.render('signup', { message: 'Your password needs to be min 4 chars' })
		return
	}
	if (username.length === 0) {
		res.render('signup', { message: 'Your username cannot be empty' })
		return
	}
	User.findOne({ username: username })
		.then(userFromDB => {
			if (userFromDB !== null) {
				res.render('signup', { message: 'Username is alredy taken' })
			} else {
				const salt = bcrypt.genSaltSync()
				const hash = bcrypt.hashSync(password, salt)
				User.create({ username, password: hash })
					.then(createdUser => {
						console.log(createdUser)
						res.redirect('/login')
					})
					.catch(err => next(err))
			}
		})
});

router.post('/login', (req, res, next) => {
	const { username, password } = req.body

	User.findOne({ username: username })
		.then(userFromDB => {
			console.log('user: ', userFromDB)
			if (userFromDB === null) {
				res.render('login', { message: 'Invalid credentials' })
				return
			}
			if (bcrypt.compareSync(password, userFromDB.password)) {
				console.log('authenticated')

				req.session.user = userFromDB
				console.log(req.session)
				res.redirect('/profile')
			}
		})
});
router.get('/login', (req, res) => {
	res.render('login')
})

function loginCheck() {
	return (req, res, next) => {
	  if (req.session.user) {
		next()
	  } else {
		res.redirect('/login')
	  }
	}
  }

router.get("/profile", loginCheck(), (req, res, next) => {
	res.cookie('myCookie', 'hello from express')
	console.log('this is the cookie: ', req.cookies)
	res.clearCookie('myCookie')
	const user = req.session.user
	res.render("profile", { user: user });
  });

router.get('/logout', (req, res, next) => {
	req.session.destroy()
	res.render('index')
});
