!(function (window, document, undefined) {
    var util;
    util = {

    }    
    $(function(){
        /* Sign In, sign Up bindings */
       $('#mainContainer').on('click','.signup-submit',function(){
           if($('#firstname').val() != '' && $('#lastname').val() !='' && $('#email').val() != '' && $('#phone').val() !='' &&$('#city').val() != '' && $('#signup-username').val() !='' &&$('#signup-password').val() != '' && $('#signupas').val() !=''){
                $('.signup-submit').text('Please Wait...').attr('disabled',true);
                $.ajax({
                    url:'/signup',
                    type:'POST',
                    data:'firstname='+$('#firstname').val()+'&lastname='+$('#lastname').val()+'&email='+$('#email').val()+'&orgname='+$('#orgname').val()+'&orgaddress='+$('#orgaddress').val()+'&phone='+$('#phone').val()+'&city='+$('#city').val()+'&username='+$('#signup-username').val()+'&password='+$('#signup-password').val()+'&signupas='+$('#categoryDropdown').val(),
                    success:function(data){
                    //alert(data) 
                        if(JSON.parse(data).sucess==true){
                            $('.signup-submit').text('Submit').attr('disabled',false);
                            $('#signUpForm').addClass('hide')
                            $('#loginForm').removeClass('hide')
                            $('.success-signup-msg').text('Thanks for Sign Up, we will notify once your account is activated.');
                        }else{
                            $('.signup-submit').text('Submit').attr('disabled',false);    
                            $('.failed-signup-msg').text(JSON.parse(data).msg).attr('tabindex',0).focus();
                        }
                    },
                    error:function(error){
                        $('.signup-submit').text('Submit').attr('disabled',false);    
                        $('.failed-signup-msg').text('There is some technical issue, Please try again later').attr('tabindex',0).focus();
                    }
                });
                return false;
           }    
        })
        $('#mainContainer').on('click','#loginButton',function(){
            if($('#username').val() !='' && $('#password').val()){
                $('#loginButton').text('Please Wait...').attr('disabled',true);
                $.ajax({
                    url:'/signin',
                    type:'POST',
                    data:'username='+$('#username').val()+'&password='+$('#password').val(),
                    success:function(data){
                    //alert(data) 
                        if(JSON.parse(data).sucess==true){
                            document.location.href='/dashboard.html'
                        }else{
                            $('#loginButton').text('Submit').attr('disabled',false);    
                            $('.success-signup-msg').text(JSON.parse(data).msg);
                        }
                    },
                    error:function(error){
                        $('#loginButton').text('Login').attr('disabled',false);    
                        $('.success-signup-msg').text('There is some technical issue, Please try again later');
                    }
                });
                return false;
           }  
        });    
        $('#signUpFormButton').on('click',function(){
            $('#loginForm').addClass('hide');
            $('.success-signup-msg,.failed-signup-msg').text('');
            $('#signupformSection').trigger('reset');
            $('#signUpForm').removeClass('hide');
        });
        $('#haveAnAccountButton').on('click',function(){
            $('.success-signup-msg,.failed-signup-msg').text('');
            $('#signUpForm').addClass('hide')
            $('#loginForm').removeClass('hide')
        });

        
    });
})(window, document);