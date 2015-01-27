$(function(){

  /* ******************
   * Global Variables *
   * ******************/

  var $video = $('#bgvid');
  var $source = $video.find('#source');
  var $sign = $('#signup');
  var $reg = $sign.find('#register');
  var $middle = $('#middle');
  var $rsvp_frost = $('#frost', '#middle');
  var $rsvp_circle = $('#rsvp', '#middle');
  var $rsvp_text = $('#rsvp_text', '#middle');
  var $rsvp_success = $('#rsvp_success', '#middle');
  var $time_left = $('#time_left');
  var $rsvp_count = $('#rsvp_count');
  var $new_user = $('#new_user');
  var $greet = $('#greet');
  var $userlink = $('#user-link');
  var $notice_reg = $('#notice-reg');
  var $notice_signin = $('#notice-signin');

  /* ***********
   * Functions *
   * ***********/

  // updates the RSVP counter
  var updateCounter = function(){
    backend.numRSVPs(function(len) {
      $rsvp_count.fadeOut('fast', function(){
        $rsvp_count.text(len).fadeIn('fast');
      });
    });
  };

  // shows the appropriate greeting
  var user;
  var updateGreeting = function(){
    user = undefined; // default
    $greet.hide();
    $new_user.hide();
    backend.checkUser(function(currentuser){ 
      user = currentuser; 
    });

    if(user !== undefined){
      $userlink.text(user.get('fullname'));
      $greet.fadeIn();
    }else{
      $new_user.fadeIn();
    }
  };

  // shows the appropriate RSVP button/checkmark 
  var rsvped; 
  var updateRSVP = function(){
    rsvped = false; // default
    $rsvp_circle.css({border: '1px solid #fff',
      cursor:'pointer'});
    $rsvp_text.css('display','none');
    $rsvp_success.css('display','none');

    var displayYesRSVP = function() {
      $rsvp_frost.css('display','none');
      $rsvp_circle.css({border: '1px solid #66BB6A',
      cursor:'auto'});
      $('#rsvp_success').fadeIn();
    };

    var displayNoRSVP = function() {
      closed = false; // default
      var time_left = backend.timeLeft();
      if (time_left === 'Closed') {
        closed = true;
        $rsvp_frost.css('display','none');
        $rsvp_circle.css('cursor','auto');
      }
      $time_left.text(time_left);
      $rsvp_text.fadeIn();
    };

    backend.checkRSVP(function(response) {
      if (response) {
        rsvped = true;
        displayYesRSVP();
      } else {
        displayNoRSVP();
      }
    }, function() {
        displayNoRSVP();
    });
  };

  /* ****************
   * Event Handlers *
   * ****************/

  // Frosts the RSVP circle on hover
  $rsvp_circle.hover(
    function(){
      if(!rsvped && !closed) {$rsvp_frost.css('display', 'block'); }
    },
    function(){
      if(!rsvped && !closed) {$rsvp_frost.css('display','none'); }
    });

  // Submits RSVP on click.
  $rsvp_circle.on('click', function(e) {

    if(rsvped || closed){ return; }
    if(user === undefined){ $('#auth-link[rel*=leanModal]').trigger('click'); return; }

    // Call the backend function to set the user's 'rsvp' var on Parse{}
    backend.sendRSVP(true, function() {
      rsvped = true;
      $rsvp_frost.css('display','none');
      $rsvp_text.fadeOut('fast', function(){
        $rsvp_circle.css({border: '1px solid #66BB6A',
        cursor:'auto'});
        $('#rsvp_success').fadeIn('slow');
      });
      updateRSVP();
      updateCounter();
    });

    e.preventDefault();
  });

  // Provide the user's email and password and sign them in
  $('#form-signin').submit(function(e) {
    backend.logIn($('#email-signin').val(), $('#pwd-signin').val(), function(username) {
      updateGreeting();
      updateRSVP();
      // TODO: hide warning $('notice-reg').hide();
    },
    function() {
      // TODO: display warning $('notice-reg').show();
    });
    e.preventDefault();
  });

  // If the passwords match, provide them to the funciton to set up a new account
  $('#form-reg').submit(function(e){
    if ($('#pwd-reg').val() === $('#pwd2-reg').val()) {
      backend.signUp($('#email-reg').val(), $('#pwd-reg').val(), $('#flname-reg').val(),
      function(user) {
        updateGreeting();
        // TODO: hide warning $('notice-reg').hide();
      });
    } else {
      // TODO: display warning $('notice-reg').show();
    }
    return false;
  });

  $('#submit-update').on('click', function(e){
    console.log('update');
    e.preventDefault();
  });

  $('#submit-unrsvp').on('click', function(e){
    backend.sendRSVP(false, function(){
      updateRSVP();
      updateCounter();
    });
    e.preventDefault();
  });

  $('#submit-signout').on('click', function(e){
    backend.logOut();
    updateGreeting();
    updateRSVP();
    e.preventDefault();
  });

  // Show login/register modal
  $('#auth-link[rel*=leanModal]').leanModal({ top: 300, overlay: 0.45, closeButton: ".hidemodal" });
  $('#auth-link2[rel*=leanModal]').leanModal({ top: 300, overlay: 0.45, closeButton: ".hidemodal" });
  $('#user-link[rel*=leanModal]').leanModal({ top: 300, overlay: 0.45, closeButton: ".hidemodal" });

  // Shows/Hides video background
  var small = false;
  $(window).on('resize', function() {
    if(small && $(this).width() > 640){
      $video.fadeToggle('slow');
      small = false;
      return;
    }

    if (!small && $(this).width() < 640){
      $video.fadeToggle('slow');
      small = true;
      return;
    }
  });

  /* **************
   * Default Code *
   * **************/

  // Sets a random motion background
  $source.attr('src', backend.generateBackground());

  // Sets the day's date
  $('#date').text(moment().format('dddd, MMMM Do YYYY'));

  // Sets the time left to RSVP
  var closed = false; // default
  var time_left = backend.timeLeft();
  if(time_left === 'Closed'){
   closed = true;
   $rsvp_frost.css('display','none');
   $rsvp_circle.css('cursor', 'auto');
  }
  $time_left.text(time_left);

  // Sets the number of RSVPs
  updateCounter();

  // Greets user, or displays signup message
  updateGreeting();

  // Check if user has RSVPed that day, display RSVP or green check mark
  updateRSVP();
});
