
var express = require('express');
var cfenv = require('cfenv');
var json = require('express-json');
var bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
var session = require('express-session')

var app = express();


app.use(express.static(__dirname + '/public'));
app.use(json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session({secret: "Shh, its a secret!"}));


// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();
var ibmdb = require('ibm_db');
//app.use(session({secret: 'testsession'}));

/********************** Begin, Sign Up *********************** */
var signup = express() // the sub app
signup.post('/', function (req, res) {

  //console.log(req.session.secret)

  var transid = uuidv4();
  var firstname = req.body.firstname;  
  var lastname = req.body.lastname; 
  var email = req.body.email; 
  var orgname = req.body.orgname;
  var orgaddress = req.body.orgaddress;
  var username = req.body.username; 
  var password = req.body.password; 
  var usertype = (req.body.signupas == 'hospital')?'hospital':'retailer'; 
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; 
  var yyyy = today.getFullYear();
  if(dd<10){
      dd='0'+dd;
  } 
  if(mm<10) {
      mm='0'+mm;
  }  
  var todayDate = mm+'/'+dd+'/'+yyyy;
  var phone = req.body.phone; 
  var city = req.body.city; 


  ibmdb.open("DRIVER={DB2};DATABASE=BLUDB;HOSTNAME=dashdb-txn-sbox-yp-dal09-08.services.dal.bluemix.net;UID=mhb58478;PWD=0+2d8x89kdf4nnpx;PORT=50000;PROTOCOL=TCPIP", function (err,conn) {
    if (err) return console.log(err);


    var checkUsername = "SELECT  USERNAME FROM MHB58478.USERS where USERNAME='"+username+"';";
    conn.query(checkUsername, [10], function (err, data) {
      if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
      
      if(data.length > 0){
        res.json({sucess:false,msg:'Please try with some other username'});
      }else{
        var query = "INSERT INTO MHB58478.USERS (\"USERID\",\"FNAME\",\"LNAME\",\"USERNAME\",\"PASSWORD\",\"USERTYPE\",\"DATE\",\"EMAIL\",\"ORGNAME\",\"ORGADDRESS\",\"PHONE\",\"CITY\",\"ACTIVE\") VALUES('"+transid+"','"+firstname+"','"+lastname+"','"+username+"','"+password+"','"+usertype+"','"+todayDate+"','"+email+"','"+orgname+"','"+orgaddress+"','"+phone+"','"+city+"',0);";  
        //console.log(query);
        conn.query(query, [10], function (err, data) {
          if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
          
          //console.log(data)
          res.json((data.length == 0)?{sucess:true}:{sucess:false});
        });
      }
      conn.close(function () {
        console.log('done');
      });
      

    });
    
  });
})
app.use('/signup', signup);
/********************** End, Sign Up *********************** */


/********************** Begin, Sign In *********************** */
var signin = express() // the sub app
signin.post('/', function (req, res) {

  var username = req.body.username; 
  var password = req.body.password; 
 
  ibmdb.open("DRIVER={DB2};DATABASE=BLUDB;HOSTNAME=dashdb-txn-sbox-yp-dal09-08.services.dal.bluemix.net;UID=mhb58478;PWD=0+2d8x89kdf4nnpx;PORT=50000;PROTOCOL=TCPIP", function (err,conn) {
    if (err) return console.log(err);


    var authenticate = "SELECT USERID, FNAME, LNAME, USERNAME, USERTYPE, ORGNAME FROM MHB58478.USERS where USERNAME='"+username+"' and password='"+password+"' and active=1;";
    conn.query(authenticate, [10], function (err, data) {
      if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
      
      if(data.length == 1){
        req.session.loggedIn = true;
        req.session.USERID = data[0].USERID;
        req.session.FNAME = data[0].FNAME;
        req.session.LNAME = data[0].LNAME;
        req.session.USERNAME = data[0].USERNAME;
        req.session.USERTYPE = data[0].USERTYPE;
        req.session.ORGNAME = data[0].ORGNAME;
        //console.log('logged In:'+req.session.loggedIn)
        res.json({sucess:true});
      }else{
        res.json({sucess:false,msg:'Authentication failed.'});
      }
      conn.close(function () {
        console.log('done');
      });

    });
    
  });
})
app.use('/signin', signin);


/********************** End, Sign In *********************** */

/********************** Begin, Logout  *********************** */
var logout = express() // the sub app
logout.post('/', function (req, res) {
    req.session.destroy();
    res.json({sucess:true});
});
app.use('/logout', logout);


/********************** End, Logout *********************** */


/********************** Begin, Admin Approval *********************** */
var approveOrg = express() // the sub app
approveOrg.post('/', function (req, res) {

  var userid = req.body.orgid; 
  
  ibmdb.open("DRIVER={DB2};DATABASE=BLUDB;HOSTNAME=dashdb-txn-sbox-yp-dal09-08.services.dal.bluemix.net;UID=mhb58478;PWD=0+2d8x89kdf4nnpx;PORT=50000;PROTOCOL=TCPIP", function (err,conn) {
    if (err) return console.log(err);


    var approveQuery = "UPDATE MHB58478.USERS SET ACTIVE = 1 WHERE USERID='"+userid+"';";
    //console.log(approveQuery);
    conn.query(approveQuery, [10], function (err, data) {

      if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
      
      //res.json({sucess:true});
      var query = "SELECT USERID, FNAME, LNAME, USERNAME, USERTYPE, DATE, EMAIL, PHONE, CITY, ORGNAME, ORGADDRESS, ACTIVE  FROM MHB58478.USERS where USERTYPE<>'admin' and active=0";

      conn.query(query, [10], function (err, data) {
        if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
        
        pendingUsers = [...data];
        
        res.json({sucess:true,'pendingUsers':JSON.stringify(pendingUsers),'userType':req.session.USERTYPE,'firstname':req.session.FNAME,'lastname':req.session.LNAME});
  
      });

      conn.close(function () {
        console.log('done');
      });

    });
    
  });
})
app.use('/approveOrg', approveOrg);


/********************** End, Admin Approval *********************** */


/********************** Begin, Validate Session *********************** */
var validateSession = express() // the sub app
validateSession.post('/', function (req, res) {
 
  if(req.session.loggedIn){
    var pendingUsers;
    var orderDetails;
    var retaliersInventory;
    var allRetailerDetails;
     
    ibmdb.open("DRIVER={DB2};DATABASE=BLUDB;HOSTNAME=dashdb-txn-sbox-yp-dal09-08.services.dal.bluemix.net;UID=mhb58478;PWD=0+2d8x89kdf4nnpx;PORT=50000;PROTOCOL=TCPIP", function (err,conn) {
      if (err) return console.log(err);
      
      var query;
      
      if(req.session.USERTYPE == 'admin'){
          query = "SELECT USERID, FNAME, LNAME, USERNAME, USERTYPE, DATE, EMAIL, PHONE, CITY, ORGNAME, ORGADDRESS, ACTIVE  FROM MHB58478.USERS where USERTYPE<>'admin' and active=0";

          conn.query(query, [10], function (err, data) {
            if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
            
            pendingUsers = [...data];
            
            res.json({sucess:true,'pendingUsers':JSON.stringify(pendingUsers),'userType':req.session.USERTYPE,'firstname':req.session.FNAME,'lastname':req.session.LNAME,'orgname':req.session.ORGNAME});
      
          });

          conn.close(function () {
            console.log('done');
          });

      }else if(req.session.USERTYPE == 'hospital'){
          query = "SELECT USERID, FNAME, LNAME, EMAIL, PHONE, CITY, ORGNAME, ORGADDRESS  FROM MHB58478.USERS where USERTYPE='retailer' and active=1;";

          conn.query(query, [10], function (err, data) {
            if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
            
            allRetailerDetails = [...data];

            /*var orderDetailsQuery = "SELECT ORDERID, FNAME, LNAME, EMAIL, PHONE, CITY, ORGNAME, ORGADDRESS  FROM MHB58478.USERS where USERTYPE='retailer' and active=1;";
            conn.query(orderDetailsQuery, [10], function (err, data) {
              if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
              
              orderDetails = [...data];
            });*/  
  
            res.json({sucess:true,'orders':'dfsdfsdfds','allRetailerDetails':JSON.stringify(allRetailerDetails),'userType':req.session.USERTYPE,'firstname':req.session.FNAME,'lastname':req.session.LNAME,'orgname':req.session.ORGNAME});
            
            conn.close(function () {
              console.log('done');
            });

          });

          

      }else{
        query = "SELECT INVENTORYID, INVENTORYNAME, DESCRIPTION, QUANTITY, PRICE  FROM MHB58478.INVENTORY where userid='"+req.session.USERID+"' ";

        conn.query(query, [10], function (err, data) {
          if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
          
          retaliersInventory = [...data];

          /*var orderDetailsQuery = "SELECT ORDERID, FNAME, LNAME, EMAIL, PHONE, CITY, ORGNAME, ORGADDRESS  FROM MHB58478.USERS where USERTYPE='retailer' and active=1;";
            conn.query(orderDetailsQuery, [10], function (err, data) {
              if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
              
              orderDetails = [...data];
            });*/   
          
          res.json({sucess:true,'orders':'dfsdfsdfds','retaliersInventory':JSON.stringify(retaliersInventory),'userType':req.session.USERTYPE,'firstname':req.session.FNAME,'lastname':req.session.LNAME,'orgname':req.session.ORGNAME});
          
          conn.close(function () {
            console.log('done');
          });

        });
      }    
        
    });

    //res.json({sucess:true,'pendingUsers':'{'+pendingUsers+'}','userType':req.session.USERTYPE,'firstname':req.session.FNAME,'lastname':req.session.LNAME});
  }else{
    res.json({sucess:false,msg:'Session invalid'});
  }
  /* 
 */
})
app.use('/validateSession', validateSession);


/********************** End, Validate Session *********************** */


/********************** Begin, get Approved Hospital users Session *********************** */
var approvedHospitalUsers = express() // the sub app
approvedHospitalUsers.post('/', function (req, res) {
 
  if(req.session.loggedIn){
    var pendingUsers;
      
    ibmdb.open("DRIVER={DB2};DATABASE=BLUDB;HOSTNAME=dashdb-txn-sbox-yp-dal09-08.services.dal.bluemix.net;UID=mhb58478;PWD=0+2d8x89kdf4nnpx;PORT=50000;PROTOCOL=TCPIP", function (err,conn) {
      if (err) return console.log(err);
      
      var query;
      
         query = "SELECT USERID, FNAME, LNAME, USERNAME, USERTYPE, DATE, EMAIL, PHONE, CITY, ORGNAME, ORGADDRESS, ACTIVE  FROM MHB58478.USERS where USERTYPE='hospital' and active=1";

          conn.query(query, [10], function (err, data) {
            if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
            
            pendingUsers = [...data];
            
            res.json({sucess:true,'approvedHospitalUsers':JSON.stringify(pendingUsers)});
      
          });

          conn.close(function () {
            console.log('done');
          });
    });

    //res.json({sucess:true,'pendingUsers':'{'+pendingUsers+'}','userType':req.session.USERTYPE,'firstname':req.session.FNAME,'lastname':req.session.LNAME});
  }else{
    res.json({sucess:false,msg:'Session invalid'});
  }
  /* 
 */
})
app.use('/approvedHospitalUsers', approvedHospitalUsers);


/********************** End, get Approved Hospital users *********************** */

/********************** Begin, get Approved Retaler users Session *********************** */
var approvedRetalerUsers = express() // the sub app
approvedRetalerUsers.post('/', function (req, res) {
 
  if(req.session.loggedIn){
    var pendingUsers;
     
    ibmdb.open("DRIVER={DB2};DATABASE=BLUDB;HOSTNAME=dashdb-txn-sbox-yp-dal09-08.services.dal.bluemix.net;UID=mhb58478;PWD=0+2d8x89kdf4nnpx;PORT=50000;PROTOCOL=TCPIP", function (err,conn) {
      if (err) return console.log(err);
      
      var query;
      
         query = "SELECT USERID, FNAME, LNAME, USERNAME, USERTYPE, DATE, EMAIL, PHONE, CITY, ORGNAME, ORGADDRESS, ACTIVE  FROM MHB58478.USERS where USERTYPE='retailer' and active=1";

          conn.query(query, [10], function (err, data) {
            if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
            
            pendingUsers = [...data];
            
            res.json({sucess:true,'approvedRetalerUsers':JSON.stringify(pendingUsers)});
      
          });

          conn.close(function () {
            console.log('done');
          });
    });

    //res.json({sucess:true,'pendingUsers':'{'+pendingUsers+'}','userType':req.session.USERTYPE,'firstname':req.session.FNAME,'lastname':req.session.LNAME});
  }else{
    res.json({sucess:false,msg:'Session invalid'});
  }
  /* 
 */
})
app.use('/approvedRetalerUsers', approvedRetalerUsers);


/********************** End, get Approved Retaler users *********************** */

/********************** Begin, Manage Inventory *********************** */
var manageInventory = express() // the sub app
manageInventory.post('/', function (req, res) {

  if(req.session.loggedIn){
    var transid = uuidv4();
    var userid = req.session.USERID;
    var userAction = req.body.useraction; 
   
      ibmdb.open("DRIVER={DB2};DATABASE=BLUDB;HOSTNAME=dashdb-txn-sbox-yp-dal09-08.services.dal.bluemix.net;UID=mhb58478;PWD=0+2d8x89kdf4nnpx;PORT=50000;PROTOCOL=TCPIP", function (err,conn) {
        if (err) return console.log(err);
        var retaliersInventory;
        if(userAction === 'addInventory'){
          
          var inventoryname = req.body.inventoryname;  
          var description = req.body.description; 
          var quantity = req.body.quantity; 
          var price = req.body.price; 

          var query = "INSERT INTO MHB58478.INVENTORY (\"INVENTORYID\",\"USERID\",\"INVENTORYNAME\",\"DESCRIPTION\",\"QUANTITY\",\"PRICE\") VALUES('"+transid+"','"+userid+"','"+inventoryname+"','"+description+"','"+quantity+"','"+price+"');";  
          conn.query(query, [10], function (err, data) {
            if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
            
            //console.log(data)
            query = "SELECT INVENTORYID, INVENTORYNAME, DESCRIPTION, QUANTITY, PRICE  FROM MHB58478.INVENTORY where userid='"+userid+"' ";

            conn.query(query, [10], function (err, data) {
              if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
              
              retaliersInventory = [...data];
              
              res.json({sucess:true,'orders':'dfsdfsdfds','retaliersInventory':JSON.stringify(retaliersInventory)});
            });

            conn.close(function () {
              console.log('done');
            });
            //res.json((data.length == 0)?{sucess:true}:{sucess:false});
          });
          

        }else if(userAction === 'deleteInventory'){
          
          var inventoryid = req.body.inventoryid;  

          var query = "DELETE FROM MHB58478.INVENTORY where userid='"+userid+"' AND inventoryid='"+inventoryid+"';";  
          conn.query(query, [10], function (err, data) {
            if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
            
            query = "SELECT INVENTORYID, INVENTORYNAME, DESCRIPTION, QUANTITY, PRICE  FROM MHB58478.INVENTORY where userid='"+req.session.USERID+"' ";

            conn.query(query, [10], function (err, data) {
              if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
              
              retaliersInventory = [...data];
              
              res.json({sucess:true,'orders':'dfsdfsdfds','retaliersInventory':JSON.stringify(retaliersInventory)});
            });

            conn.close(function () {
              console.log('done');
            });
          });
        
        }else{

        }
        
      
      });
    }else{
      res.json({sucess:false,msg:'Session invalid'});
    }    
})
app.use('/manageInventory', manageInventory);
/********************** End, Manage Inventory *********************** */


/********************** Begin, Order Inventory (by hospital) *********************** */
var orderInventory = express() // the sub app
orderInventory.post('/', function (req, res) {

  if(req.session.loggedIn){
    var transid = uuidv4();
    var hospitaluserid = req.session.USERID;
    var orders = JSON.parse( req.body.orders );
    var status = 'PENDING';
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd;
    } 
    if(mm<10) {
        mm='0'+mm;
    }  
    var todayDate = mm+'/'+dd+'/'+yyyy;

      ibmdb.open("DRIVER={DB2};DATABASE=BLUDB;HOSTNAME=dashdb-txn-sbox-yp-dal09-08.services.dal.bluemix.net;UID=mhb58478;PWD=0+2d8x89kdf4nnpx;PORT=50000;PROTOCOL=TCPIP", function (err,conn) {
        if (err) return console.log(err);

        for (var i=0; i< orders.length; i++){
          var retaileruserid = orders[i].retailerid; 
          var inventoryid = orders[i].inventoryid
          var quantity = orders[i].qty;
          var totalprice = (orders[i].price*quantity);

          var query = "INSERT INTO MHB58478.ORDERS (\"ORDERID\",\"HOSPITAL_USERID\",\"RETAILER_USERID\",\"INVENTORYID\",\"QUANTITY\",\"TOTALPRICE\",\"STATUS\",\"TRANSACTIONDATE\") VALUES('"+transid+"','"+hospitaluserid+"','"+retaileruserid+"','"+inventoryid+"','"+quantity+"','"+totalprice+"','"+status+"','"+todayDate+"');";  
          //console.log(query);
          conn.query(query, [10], function (err, data) {
            if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
          });

          var updateInventory = "UPDATE MHB58478.INVENTORY SET QUANTITY = QUANTITY-"+quantity+" WHERE INVENTORYID = '"+inventoryid+"';";  
          //console.log(updateInventory);
          conn.query(updateInventory, [10], function (err, data) {
            if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
          });  
        }
        res.json({sucess:true});
        conn.close(function () {
          console.log('done');
        });
      
      });
    }else{
      res.json({sucess:false,msg:'Session invalid'});
    }    
})
app.use('/orderInventory', orderInventory);
/********************** End, Order Inventory *********************** */


/********************** Begin, View Inventory Details *********************** */
var viewInventories = express() // the sub app
viewInventories.post('/', function (req, res) {

  var retailerid = req.body.retailerid; 
  var retaliersInventory;
  
  ibmdb.open("DRIVER={DB2};DATABASE=BLUDB;HOSTNAME=dashdb-txn-sbox-yp-dal09-08.services.dal.bluemix.net;UID=mhb58478;PWD=0+2d8x89kdf4nnpx;PORT=50000;PROTOCOL=TCPIP", function (err,conn) {
    if (err) return console.log(err);

    var query = "SELECT INVENTORYID, INVENTORYNAME, DESCRIPTION, QUANTITY, PRICE, USERID as RETAILERID  FROM MHB58478.INVENTORY where userid='"+retailerid+"' ";

    conn.query(query, [10], function (err, data) {
      if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
      
      retaliersInventory = [...data];
      
      res.json({sucess:true,'retaliersInventory':JSON.stringify(retaliersInventory)});
    });

    conn.close(function () {
      console.log('done');
    });

    
  });
})
app.use('/viewInventories', viewInventories);


/********************** End, View Inventory Details *********************** */

/********************** Begin, View Hospital OnGoing Order Details *********************** */
var viewHospitalsOngoingOrders = express() // the sub app
viewHospitalsOngoingOrders.post('/', function (req, res) {

  var userid = req.session.USERID;
  var onGoingOrders;
  
  ibmdb.open("DRIVER={DB2};DATABASE=BLUDB;HOSTNAME=dashdb-txn-sbox-yp-dal09-08.services.dal.bluemix.net;UID=mhb58478;PWD=0+2d8x89kdf4nnpx;PORT=50000;PROTOCOL=TCPIP", function (err,conn) {
    if (err) return console.log(err);

    var query = "SELECT O.ORDERID, O.HOSPITAL_USERID, O.RETAILER_USERID, O.INVENTORYID, O.QUANTITY, O.TOTALPRICE, O.STATUS, O.TRANSACTIONDATE, US.ORGNAME, I.INVENTORYNAME FROM MHB58478.ORDERS O inner join MHB58478.USERS US on O.RETAILER_USERID=US.USERID  inner join INVENTORY I on  O.INVENTORYID=I.INVENTORYID where O.HOSPITAL_USERID='"+userid+"' AND (STATUS='PENDING' OR STATUS='PROCESSED');";

    conn.query(query, [10], function (err, data) {
      if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
      
      onGoingOrders = [...data];
      
      res.json({sucess:true,'onGoingOrders':JSON.stringify(onGoingOrders)});
    });

    conn.close(function () {
      console.log('done');
    });

    
  });
})
app.use('/viewHospitalsOngoingOrders', viewHospitalsOngoingOrders);


/********************** End, View Hospital OnGoing Order Details *********************** */


/********************** Begin, View Hospital Order History Details *********************** */
var viewHospitalsOrderHistory = express() // the sub app
viewHospitalsOrderHistory.post('/', function (req, res) {

  var userid = req.session.USERID;
  var ordersHistory;
  
  ibmdb.open("DRIVER={DB2};DATABASE=BLUDB;HOSTNAME=dashdb-txn-sbox-yp-dal09-08.services.dal.bluemix.net;UID=mhb58478;PWD=0+2d8x89kdf4nnpx;PORT=50000;PROTOCOL=TCPIP", function (err,conn) {
    if (err) return console.log(err);

    var query = "SELECT O.ORDERID, O.HOSPITAL_USERID, O.RETAILER_USERID, O.INVENTORYID, O.QUANTITY, O.TOTALPRICE, O.STATUS, O.TRANSACTIONDATE, US.ORGNAME, I.INVENTORYNAME FROM MHB58478.ORDERS O inner join MHB58478.USERS US on O.RETAILER_USERID=US.USERID  inner join INVENTORY I on  O.INVENTORYID=I.INVENTORYID where O.HOSPITAL_USERID='"+userid+"' AND STATUS='DELIVERED';";

    conn.query(query, [10], function (err, data) {
      if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
      
      ordersHistory = [...data];
      
      res.json({sucess:true,'ordersHistory':JSON.stringify(ordersHistory)});
    });

    conn.close(function () {
      console.log('done');
    });

    
  });
})
app.use('/viewHospitalsOrderHistory', viewHospitalsOrderHistory);


/********************** End, View Hospital Order History Details *********************** */


/********************** Begin, View Retailer Upcoming Order Details *********************** */
var viewRetailersUpcomingOrders = express() // the sub app
viewRetailersUpcomingOrders.post('/', function (req, res) {

  var userid = req.session.USERID;
  var onGoingOrders;
  
  ibmdb.open("DRIVER={DB2};DATABASE=BLUDB;HOSTNAME=dashdb-txn-sbox-yp-dal09-08.services.dal.bluemix.net;UID=mhb58478;PWD=0+2d8x89kdf4nnpx;PORT=50000;PROTOCOL=TCPIP", function (err,conn) {
    if (err) return console.log(err);

    var query = "SELECT O.ORDERID, O.HOSPITAL_USERID, O.RETAILER_USERID, O.INVENTORYID, O.QUANTITY, O.TOTALPRICE, O.STATUS, O.TRANSACTIONDATE, US.ORGNAME, I.INVENTORYNAME FROM MHB58478.ORDERS O inner join MHB58478.USERS US on O.RETAILER_USERID=US.USERID  inner join INVENTORY I on  O.INVENTORYID=I.INVENTORYID where O.RETAILER_USERID='"+userid+"' AND (STATUS='PENDING' OR STATUS='PROCESSED');";

    conn.query(query, [10], function (err, data) {
      if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
      
      onGoingOrders = [...data];
      
      res.json({sucess:true,'onGoingOrders':JSON.stringify(onGoingOrders)});
    });

    conn.close(function () {
      console.log('done');
    });

    
  });
})
app.use('/viewRetailersUpcomingOrders', viewRetailersUpcomingOrders);


/********************** End, View Retailer upcomUing Order Details *********************** */


/********************** Begin, View Retailer Order History Details *********************** */
var viewRetailersOrderHistory = express() // the sub app
viewRetailersOrderHistory.post('/', function (req, res) {

  var userid = req.session.USERID;
  var ordersHistory;
  
  ibmdb.open("DRIVER={DB2};DATABASE=BLUDB;HOSTNAME=dashdb-txn-sbox-yp-dal09-08.services.dal.bluemix.net;UID=mhb58478;PWD=0+2d8x89kdf4nnpx;PORT=50000;PROTOCOL=TCPIP", function (err,conn) {
    if (err) return console.log(err);

    var query = "SELECT O.ORDERID, O.HOSPITAL_USERID, O.RETAILER_USERID, O.INVENTORYID, O.QUANTITY, O.TOTALPRICE, O.STATUS, O.TRANSACTIONDATE, US.ORGNAME, I.INVENTORYNAME FROM MHB58478.ORDERS O inner join MHB58478.USERS US on O.RETAILER_USERID=US.USERID  inner join INVENTORY I on  O.INVENTORYID=I.INVENTORYID where O.RETAILER_USERID='"+userid+"' AND STATUS='DELIVERED';";

    conn.query(query, [10], function (err, data) {
      if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
      
      ordersHistory = [...data];
      
      res.json({sucess:true,'ordersHistory':JSON.stringify(ordersHistory)});
    });

    conn.close(function () {
      console.log('done');
    });

    
  });
})
app.use('/viewRetailersOrderHistory', viewRetailersOrderHistory);


/********************** End, View Retailer Order History Details *********************** */


/********************** Begin, Approve Upcoming Order Details *********************** */
var approveOrders = express() // the sub app
approveOrders.post('/', function (req, res) {

  var orderid =  req.body.orderid; 
  var hospitalidid =  req.body.hospitalidid; 
  var retaileruserid =  req.body.retaileruserid; 
  var inventoryid =  req.body.inventoryid; 
  var onGoingOrders;
  
  ibmdb.open("DRIVER={DB2};DATABASE=BLUDB;HOSTNAME=dashdb-txn-sbox-yp-dal09-08.services.dal.bluemix.net;UID=mhb58478;PWD=0+2d8x89kdf4nnpx;PORT=50000;PROTOCOL=TCPIP", function (err,conn) {
    if (err) return console.log(err);

    var query = "UPDATE MHB58478.ORDERS SET STATUS = 'PROCESSED' WHERE ORDERID='"+orderid+"' AND HOSPITAL_USERID='"+hospitalidid+"' AND RETAILER_USERID='"+retaileruserid+"' AND INVENTORYID='"+inventoryid+"';";

    conn.query(query, [10], function (err, data) {
      if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
    });

    var subquery = "SELECT O.ORDERID, O.HOSPITAL_USERID, O.RETAILER_USERID, O.INVENTORYID, O.QUANTITY, O.TOTALPRICE, O.STATUS, O.TRANSACTIONDATE, US.ORGNAME, I.INVENTORYNAME FROM MHB58478.ORDERS O inner join MHB58478.USERS US on O.RETAILER_USERID=US.USERID  inner join INVENTORY I on  O.INVENTORYID=I.INVENTORYID where O.RETAILER_USERID='"+retaileruserid+"' AND (STATUS='PENDING' OR STATUS='PROCESSED');";

    conn.query(subquery, [10], function (err, data) {
      if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
      
      onGoingOrders = [...data];
      
      res.json({sucess:true,'onGoingOrders':JSON.stringify(onGoingOrders)});
    });

    conn.close(function () {
      console.log('done');
    });

    
  });
})
app.use('/approveOrders', approveOrders);


/********************** End, Approve upcomUing Order Details *********************** */


/********************** Begin, Acknowledge Order Details *********************** */
var acknowledgeDelivery = express() // the sub app
acknowledgeDelivery.post('/', function (req, res) {

  var orderid =  req.body.orderid; 
  var hospitalidid =  req.body.hospitalidid; 
  var retaileruserid =  req.body.retaileruserid; 
  var inventoryid =  req.body.inventoryid; 
  var onGoingOrders;
  
  ibmdb.open("DRIVER={DB2};DATABASE=BLUDB;HOSTNAME=dashdb-txn-sbox-yp-dal09-08.services.dal.bluemix.net;UID=mhb58478;PWD=0+2d8x89kdf4nnpx;PORT=50000;PROTOCOL=TCPIP", function (err,conn) {
    if (err) return console.log(err);

    var query = "UPDATE MHB58478.ORDERS SET STATUS = 'DELIVERED' WHERE ORDERID='"+orderid+"' AND HOSPITAL_USERID='"+hospitalidid+"' AND RETAILER_USERID='"+retaileruserid+"' AND INVENTORYID='"+inventoryid+"';";

    conn.query(query, [10], function (err, data) {
      if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
    });

    var subquery = "SELECT O.ORDERID, O.HOSPITAL_USERID, O.RETAILER_USERID, O.INVENTORYID, O.QUANTITY, O.TOTALPRICE, O.STATUS, O.TRANSACTIONDATE, US.ORGNAME, I.INVENTORYNAME FROM MHB58478.ORDERS O inner join MHB58478.USERS US on O.HOSPITAL_USERID=US.USERID  inner join INVENTORY I on  O.INVENTORYID=I.INVENTORYID where O.HOSPITAL_USERID='"+hospitalidid+"' AND (STATUS='PENDING' OR STATUS='PROCESSED');";

    conn.query(subquery, [10], function (err, data) {
      if (err)  res.json({sucess:false,msg:'There is some technical error, please try again.'});
      
      onGoingOrders = [...data];
      
      res.json({sucess:true,'onGoingOrders':JSON.stringify(onGoingOrders)});
    });

    conn.close(function () {
      console.log('done');
    });

    
  });
})
app.use('/acknowledgeDelivery', acknowledgeDelivery);


/********************** End, Acknowledgeg Order Details *********************** */


// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  console.log("server starting on " + appEnv.url);
});
