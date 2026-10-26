module.exports = function (app, passport, db, ObjectID) {

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    res.render('index.ejs');
  });

  // PROFILE SECTION =========================


  app.get('/profile', isLoggedIn, function (req, res) {
    db.collection('SavedNasaImageOfTheDay').find().toArray((err, result) => {
      if (err) return console.log(err)
      let mostUpvotedImage = []
      let test = result.some(document =>{
        return document.counter > 0 ? true : false
      })
      if (test && result.length > 0) {
        let greatestCounterValue = result.reduce((max, current) => {
          return current.counter > max ? current.counter : max;
        }, 0)
        mostUpvotedImage = result.filter(document => {
          return document.counter === greatestCounterValue
        })
      }

      let listOfSavedImagesExcludingTopVoted = result.filter(document => {
        return !mostUpvotedImage.includes(document) 
      })
      res.render('profile.ejs', {
        user: req.user,
        ArrayOfDocumentsFromMongoDBCollectionExpenseList: result,
        listOfSavedImagesExcludingTopVoted: listOfSavedImagesExcludingTopVoted,

        mostUpvotedImage: mostUpvotedImage
      })
    })
  });

  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout(() => {
      console.log('User has logged out!')
    });
    res.redirect('/');
  });

  // Webpage board routes ===============================================================


  app.post('/saveUserImage', (req, res) => {
    db.collection('SavedNasaImageOfTheDay').save({
      user: req.user.local.email,
      imageUrl: req.body.imageUrl,
      imageDate: req.body.imageDate,
      userDescription: req.body.description,
      counter: 0,
      KingOfHill: false
    }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/profile')
    })
  })

  app.put('/upvote', (req, res) => {
    db.collection('SavedNasaImageOfTheDay')
      .findOneAndUpdate({
        _id: new ObjectID(req.body.collectionDocumentID) // this thing is a class, 
      }, {
        $inc: {
          counter: 1
        }
      },
        {
          sort: { _id: -1 },
          upsert: true
        }, (err, result) => {
          if (err) return res.send(err)
          res.send(result)
        })
  })

  app.put('/downVote', (req, res) => {
    db.collection('SavedNasaImageOfTheDay')
      .findOneAndUpdate({
        _id: new ObjectID(req.body.collectionDocumentID) // this thing is a class, 
      }, {
        $inc: {
          counter: -1
        }
      },
        {
          sort: { _id: -1 },
          upsert: true
        }, (err, result) => {
          if (err) return res.send(err)
          res.send(result)
        })
  })

  app.delete('/deleteItem', (req, res) => {
    db.collection('SavedNasaImageOfTheDay').findOneAndDelete({
      _id: new ObjectID(req.body.collectionDocumentID)
    }, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  })

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
