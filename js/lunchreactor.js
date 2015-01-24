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
  var $time_left = $('#time_left');
  var $rsvp_count = $('#rsvp_count');
  var $new_user = $('#new_user');
  var $greet = $('#greet');
  var $notice_reg = $('#notice-reg');
  var $notice_signin = $('#notice-signin');

  /* ***********
   * Functions *
   * ***********/

  // updates the RSVP counter
  var updateRsvpCounter = function(num){
    $rsvp_count.fadeOut('fast', function(){
      $rsvp_count.text(num).fadeIn('fast');
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
  $rsvp_circle.on('click',function() {

    // Call the backend function to set the user's 'rsvp' var on Parse{}
    backend.sendRSVP(true, function() {
      if(rsvped || closed){ return; }

      rsvped = true;
      $rsvp_frost.css('display','none');
      $('#rsvp_text').fadeOut('fast', function(){
        $rsvp_circle.css({border: '1px solid #66BB6A',
        cursor:'auto'});
        $('#rsvp_success').fadeIn('slow');
      });
    });
  });

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
  backend.numRSVPs(function(len) {
    updateRsvpCounter(len);
  });

  // Greets user, or displays signup message
  var user;
  backend.checkUser(function(username){ user = username; });
  if(user !== undefined){
    $new_user.hide();
    $greet.html('You\'re all that and a bag of chips, ' + user + '.<br> Mmm... chips.').show();
  }

  // Check if user has RSVPed that day, display RSVP or green check mark
  var rsvped = false; // default
  backend.checkRSVP(function(response) {
   if (response) {
     rsvped = response;
     if (rsvped) {
       $rsvp_frost.css('display','none');
       $('#rsvp_text').hide();
       $rsvp_circle.css({border: '1px solid #66BB6A',
       cursor:'auto'});
       $('#rsvp_success').show();
     }
   }
  });

  $('#form-signin').submit(function(e){
    console.log('login');
      return false;
    });

  // $('#registerform').submit(function(e){
  //   backend.signUp($('#username').val(), $('#password').val(), $('#fullname').val(),
  //     function(user) {
  //       $new_user.hide();
  //       $greet.html('Welcome back, ' + user + '!<br>You look fantastic today.').show();
  //     });
  //   return false;
  // });
  //
  // $('#loginform').submit(function(e){
  //   backend.logIn($('#username').val(), $('#password').val(), function(user) {
  //     $new_user.hide();
  //     $greet.html('Welcome back, ' + user + '!<br>You look fantastic today.').show();
  //   });
  //   return false;
  // });

  $('#form-reg').submit(function(e){
    console.log('register');
    return false;
  });

  $('.modaltrigger').leanModal({ top: 300, overlay: 0.45, closeButton: ".hidemodal" });

});
