var express = require('express');
var forms = require('forms');
var csurf = require('csurf');
var collectFormErrors = require('express-stormpath/lib/helpers').collectFormErrors;
var stormpath = require('express-stormpath');
var extend = require('xtend');


var profileForm = forms.create({
  givenName: forms.fields.string({
    required: true
  }),
  surname: forms.fields.string({ required: true }),
  streetAddress: forms.fields.string(),
  city: forms.fields.string(),
  state: forms.fields.string(),
  zip: forms.fields.string()
});

function renderForm(req,res,locals){
  res.render('profile', extend({
    title: 'My Profile',
    csrfToken: req.csrfToken(),
    givenName: req.user.givenName,
    surname: req.user.surname,
    streetAddress: req.user.customData.streetAddress,
    city: req.user.customData.city,
    state: req.user.customData.state,
    zip: req.user.customData.zip
  },locals||{}));
}


module.exports = function profile(){

  var router = express.Router();

  router.use(csurf({ sessionKey: 'stormpathSession' }));


  router.all('/', function(req, res) {
    profileForm.handle(req,{
      success: function(form){

        req.user.givenName = form.data.givenName;
        req.user.surname = form.data.surname;
        req.user.customData.streetAddress = form.data.streetAddress;
        req.user.customData.city = form.data.city;
        req.user.customData.state = form.data.state;
        req.user.customData.zip = form.data.zip;
        req.user.customData.save();
        req.user.save(function(err){
          if(err){
            if(err.developerMessage){
              console.error(err);
            }
            renderForm(req,res,{
              errors: [{
                error: err.userMessage ||
                err.message || String(err)
              }]
            });
          }else{
            renderForm(req,res,{
              saved:true
            });
          }
        });
      },
      error: function(form){

        renderForm(req,res,{
          errors: collectFormErrors(form)
        });
      },
      empty: function(){

        renderForm(req,res);
      }
    });
  });


  router.use(function (err, req, res, next) {
    if (err.code === 'EBADCSRFTOKEN'){

      if(req.user){
        renderForm(req,res,{
          errors:[{error:'Your form has expired.  Please try again.'}]
        });
      }else{
        res.redirect('/');
      }
    }else{
      return next(err);
    }
  });

  return router;
};
