!(function (window, document, undefined) {

    var util = {
        adminSection : function(response){
            var pendingForApprovalTable = '';
            var approvedHospitalTable = '';
            var approvedRetailerTable = '';
            var pendingUsers = JSON.parse(response.pendingUsers);
            var oddEven = '';
            for(var i=0;i<pendingUsers.length;i++){
                if(i%2 == 0){
                    oddEven = 'even';
                }else{
                    oddEven = 'odd';
                }
                pendingForApprovalTable += '<tr role="row" class='+oddEven+'><td>'+pendingUsers[i].FNAME+'</td><td>'+pendingUsers[i].LNAME+'</td><td>'+pendingUsers[i].ORGNAME+'</td><td>'+pendingUsers[i].ORGADDRESS+'</td><td>'+pendingUsers[i].USERTYPE+'</td><td>'+pendingUsers[i].EMAIL+'</td><td>'+pendingUsers[i].PHONE+'</td><td>'+pendingUsers[i].CITY+'</td><td>'+pendingUsers[i].DATE+'</td><td><a data-id="'+pendingUsers[i].USERID+'" class="approve" href="#" title="Approve" ><i class="fa fa-check-square-o" aria-hidden="true"></i></a><a class="reject" href="#" title="Reject" ><i class="material-icons">&#xE872;</i></a></td></tr>'; 
                   
            }

            //$('#approved-hospital-table tbody').html(approvedHospitalTable);
            //$('#approved-retailer-table tbody').html(approvedRetailerTable);
            $('#admin-home').removeClass('hide');
            $('#bootstrap-data-table tbody').html(pendingForApprovalTable);
            $('#bootstrap-data-table').DataTable();
            //$('#approved-hospital-table').DataTable();
            //$('#approved-retailer-table').DataTable();
        },
        retaliersSection : function(response){
            var receivedJsonData = JSON.parse(response.retaliersInventory);
            var inventoryTables;
            var upComingOrders;
            var oddEven = '';
            for(var i=0;i<receivedJsonData.length;i++){
                if(i%2 == 0){
                    oddEven = 'even';
                }else{
                    oddEven = 'odd';
                }
                inventoryTables += '<tr role="row" class='+oddEven+'><td>'+receivedJsonData[i].INVENTORYNAME+'</td><td>'+receivedJsonData[i].DESCRIPTION+'</td><td>'+receivedJsonData[i].QUANTITY+'</td><td>'+receivedJsonData[i].PRICE+'</td><td><a data-id="'+receivedJsonData[i].INVENTORYID+'" class="editinventory" href="#" title="Edit" ><i class="material-icons">&#xE254;</i></a><a data-id="'+receivedJsonData[i].INVENTORYID+'" class="deleteinventory" href="#" title="Delete" ><i class="material-icons">&#xE872;</i></a></td></tr>'; 
            }

            $('#inventryTable tbody').html(inventoryTables);
            //$('#upComingOrdersTable tbody').html(upComingOrders);
            $('#retailer-home').removeClass('hide');
            inventoryTables != '' ? $('#inventryTable').DataTable() : '';
            //$('#upComingOrdersTable').DataTable('refresh');
        }
    }
     
    $(function(){
        $('#loader').css('display','block');
        $.ajax({
            url:'/validateSession',
            type:'POST',
            success:function(data){
                $('#loader').css('display','none');
                var response = JSON.parse(data);
                if(response.sucess==true){
                    $('.section-heading').html(response.orgname); //for hospital and retailers
                    if(response.userType === 'admin'){

                        util.adminSection(response);

                    }else if(response.userType === 'retailer'){
                        
                        util.retaliersSection(response)

                    }else{ 
                        var allRetailerDetails = JSON.parse(response.allRetailerDetails);
                        var approvedRetailers;
                        var ongoingOrders;
                        var oddEven = '';
                        for(var i=0;i<allRetailerDetails.length;i++){
                            if(i%2 == 0){
                                oddEven = 'even';
                            }else{
                                oddEven = 'odd';
                            }
                            approvedRetailers += '<tr role="row" class='+oddEven+'><td><a data-id="'+allRetailerDetails[i].USERID+'" class="viewinventory" href="#" title="View Inventor" >View Inventory</a></td><td>'+allRetailerDetails[i].FNAME+'</td><td>'+allRetailerDetails[i].LNAME+'</td><td class="orgname">'+allRetailerDetails[i].ORGNAME+'</td><td>'+allRetailerDetails[i].ORGADDRESS+'</td><td>'+allRetailerDetails[i].EMAIL+'</td><td>'+allRetailerDetails[i].PHONE+'</td><td>'+allRetailerDetails[i].CITY+'</td></tr>';  
                        }
                        var number;
                        if(JSON.parse( sessionStorage.getItem( "cart") ) == null  ){
                            number = 0;
                        }else{
                            number = JSON.parse( sessionStorage.getItem( "cart") ).length;
                        }
                        
                         $('.cart-count').text( number  );

                        $('#approvedRetailerTable tbody').html(approvedRetailers);
                        //$('#ongoingOrdersTable tbody').html(ongoingOrders);
                        approvedRetailers != '' ? $('#approvedRetailerTable').DataTable() : '';
                        //$('#ongoingOrdersTable').DataTable('refresh');
                        
                        $('#hospital-home').removeClass('hide');
                    }
                    var currentUserHeading = $('.'+ data.userType + '-user-name');
                    currentUserHeading.html(data.firstname + ' ' + data.lastname);
                }else {
                    document.location.href='/index.html'
                }
            },
            error:function(error){
                //$('#loginButton').text('Login').attr('disabled',false);    
                //$('.success-signup-msg').text('There is some technical issue, Please try again later');
            }
        });
        
        $(document).on('click','#approved-hospital-tab',function(){
            $('#loader').css('display','block');
            $.ajax({
                url:'/approvedHospitalUsers',
                type:'POST',
                success:function(data){
                    $('#loader').css('display','none');
                    var response = JSON.parse(data);
                    if(response.sucess==true){
                        var approvedHospitalTable = '';
                        var pendingUsers = JSON.parse(response.approvedHospitalUsers);
                        var oddEven = '';
                        for(var i=0;i<pendingUsers.length;i++){
                            if(i%2 == 0){
                                oddEven = 'even';
                            }else{
                                oddEven = 'odd';
                            }
                            approvedHospitalTable += '<tr role="row" class='+oddEven+'><td>'+pendingUsers[i].FNAME+'</td><td>'+pendingUsers[i].LNAME+'</td><td>'+pendingUsers[i].ORGNAME+'</td><td>'+pendingUsers[i].ORGADDRESS+'</td><td>'+pendingUsers[i].USERTYPE+'</td><td>'+pendingUsers[i].EMAIL+'</td><td>'+pendingUsers[i].PHONE+'</td><td>'+pendingUsers[i].CITY+'</td><td>'+pendingUsers[i].DATE+'</td></tr>'; 
                            
                        }

                        $('#approved-hospital-table tbody').html(approvedHospitalTable);
                        $('#approved-hospital-table').DataTable();
                        
                    }
                },
                error:function(error){
                    //$('#loginButton').text('Login').attr('disabled',false);    
                    //$('.success-signup-msg').text('There is some technical issue, Please try again later');
                }
            });
        });    

        $(document).on('click','#approved-retailer-tab',function(){
            $('#loader').css('display','block');
            $.ajax({
                url:'/approvedRetalerUsers',
                type:'POST',
                success:function(data){
                    $('#loader').css('display','none');
                    var response = JSON.parse(data);
                    if(response.sucess==true){
                        var approvedRetailerTable = '';
                        var pendingUsers = JSON.parse(response.approvedRetalerUsers);
                        var oddEven = '';
                        for(var i=0;i<pendingUsers.length;i++){
                            if(i%2 == 0){
                                oddEven = 'even';
                            }else{
                                oddEven = 'odd';
                            }
                            approvedRetailerTable += '<tr role="row" class='+oddEven+'><td>'+pendingUsers[i].FNAME+'</td><td>'+pendingUsers[i].LNAME+'</td><td>'+pendingUsers[i].ORGNAME+'</td><td>'+pendingUsers[i].ORGADDRESS+'</td><td>'+pendingUsers[i].USERTYPE+'</td><td>'+pendingUsers[i].EMAIL+'</td><td>'+pendingUsers[i].PHONE+'</td><td>'+pendingUsers[i].CITY+'</td><td>'+pendingUsers[i].DATE+'</td></tr>'; 
                            
                        }

                        $('#approved-retailer-table tbody').html(approvedRetailerTable);
                        $('#approved-retailer-table').DataTable();
                        
                    }
                },
                error:function(error){
                    //$('#loginButton').text('Login').attr('disabled',false);    
                    //$('.success-signup-msg').text('There is some technical issue, Please try again later');
                }
            });
        }); 

        $('.logout-link').on('click',function(){
            $('#loader').css('display','block');
            $.ajax({
                url:'/logout',
                type:'POST',
                success:function(data){
                    $('#loader').css('display','none');
                    var response = JSON.parse(data);
                    if(response.sucess==true){
                        document.location.href='/index.html'
                   
                    }else {
                        document.location.href='/index.html'
                    }
                },
                error:function(error){
                    //$('#loginButton').text('Login').attr('disabled',false);    
                    //$('.success-signup-msg').text('There is some technical issue, Please try again later');
                }
            });
        });   
        
        $(document).on('click','.approve',function(){
            $('#loader').css('display','block');
            $.ajax({
                url:'/approveOrg',
                type:'POST',
                data:'orgid='+$(this).attr('data-id'),
                success:function(data){
                    $('#loader').css('display','none');
                    var response = JSON.parse(data);
                    if(JSON.parse(data).sucess==true){
                        util.adminSection(response);
                    }else{
                        //$('#loginButton').text('Submit').attr('disabled',false);    
                        //$('.success-signup-msg').text(JSON.parse(data).msg);
                    }
                },
                error:function(error){
                    //$('#loginButton').text('Login').attr('disabled',false);    
                    //$('.success-signup-msg').text('There is some technical issue, Please try again later');
                }
            });
        });    

        $(document).on("click", ".add-new", function(){
            ///var actions = $("#inventry-table td:first-child").html();
			$(this).attr("disabled", "disabled");
			var index = $("table tbody tr:last-child").index();
			var row = '<tr class="add-records">' +
				'<td><input type="text" class="form-control" name="inventoryname" id="inventoryname"></td>' +
				'<td><input type="text" class="form-control" name="inventorydescription" id="inventorydescription"></td>' +
                '<td><input type="number" class="form-control" name="inventoryQuantity" id="inventoryQuantity"></td>' +
                '<td><input type="number" class="form-control" name="inventoryPrice" id="inventoryPrice"></td>' +
                '<td><a class ="save-inventory" href="#"><i class="material-icons">&#xE03B;</i></a>' +
			'</tr>';
			$("#inventryTable tbody").prepend(row);		
			//$("table tbody tr").eq(index + 1).find(".add, .edit").toggle();		
        });
        
        $('#mainContainer').on('click','.save-inventory',function(){
            $('#loader').css('display','block');
            $.ajax({
                url:'/manageInventory',
                type:'POST',
                data:'useraction=addInventory&inventoryname='+$('#inventoryname').val()+'&description='+$('#inventorydescription').val()+'&quantity='+$('#inventoryQuantity').val()+'&price='+$('#inventoryPrice').val(),
                success:function(data){
                    if(JSON.parse(data).sucess==true){
                       $('.add-records').remove();
                       util.retaliersSection(JSON.parse(data));
                       $('.add-new').attr("disabled", false);
                       $('#loader').css('display','none');
                    }else{
                        //$('#loginButton').text('Submit').attr('disabled',false);    
                        //$('.success-signup-msg').text(JSON.parse(data).msg);
                    }
                },
                error:function(error){
                    //$('#loginButton').text('Login').attr('disabled',false);    
                    //$('.success-signup-msg').text('There is some technical issue, Please try again later');
                }
            });
        });

        $('#mainContainer').on('click','.deleteinventory',function(){
            $('#loader').css('display','block');
            $.ajax({
                url:'/manageInventory',
                type:'POST',
                data:'useraction=deleteInventory&inventoryid='+$(this).attr('data-id'),
                success:function(data){
                    if(JSON.parse(data).sucess==true){
                       //$('.add-records').remove();
                       util.retaliersSection(JSON.parse(data));
                       $('#loader').css('display','none');
                    }else{
                        //$('#loginButton').text('Submit').attr('disabled',false);    
                        //$('.success-signup-msg').text(JSON.parse(data).msg);
                    }
                },
                error:function(error){
                    //$('#loginButton').text('Login').attr('disabled',false);    
                    //$('.success-signup-msg').text('There is some technical issue, Please try again later');
                }
            });
        });

        $('#mainContainer').on('click','.viewInventoriesClose',function(){
            $('#viewInventories').css('display','none');
        })
        $('#mainContainer').on('click','.viewCartClose',function(){
            $('#viewCartDetails').css('display','none');
        })    

        $('#mainContainer').on('click','.viewinventory',function(){
            $('#viewInventryTable tbody').html('');
            $('#viewInventories .loader').removeClass('hide');
            $('#viewInventryTable').css('display','none');
            $('#viewInventories').css('display','block');
            $('.mdg-inventory').remove();
            $('#viewInventories .retailer-name').html($(this).parent().parent().find('.orgname').text());
            
            $.ajax({
                url:'/viewInventories',
                type:'POST',
                data:'retailerid='+$(this).attr('data-id'),
                success:function(data){

                    if(JSON.parse(data).sucess==true){
                        $('#viewInventories .loader').addClass('hide');
                        $('#viewInventryTable').css('display','table');
                        var receivedJson = JSON.parse(data).retaliersInventory;
                        var receivedJsonData = JSON.parse(receivedJson);
                        var viewInventories='';

                        for(var i=0;i<receivedJsonData.length;i++){
                            viewInventories += '<tr><td class="inventoryname">'+receivedJsonData[i].INVENTORYNAME+'</td><td>'+receivedJsonData[i].DESCRIPTION+'</td><td class="inventoryQuantity">'+receivedJsonData[i].QUANTITY+'</td><td class="price">'+receivedJsonData[i].PRICE+'</td><td><input type="number" class="form-control orderQuantity" name="orderQuantity" /></td><td><button data-inventoryid="'+receivedJsonData[i].INVENTORYID+'" data-retailerid="'+receivedJsonData[i].RETAILERID+'" class="addToCart" title="Order" >Add to cart</button></td></tr>'; 
                        }
                        if(viewInventories == ''){
                            $('#viewInventories .modal-body').append('<p class="mdg-inventory">No records to display.<p>');
                        }
                        $('#viewInventryTable tbody').html(viewInventories);
                        viewInventories != '' ? $('#viewInventryTable').DataTable() : '';
                        
                    }else{
                        //$('#loginButton').text('Submit').attr('disabled',false);    
                        //$('.success-signup-msg').text(JSON.parse(data).msg);
                    }
                },
                error:function(error){
                    //$('#loginButton').text('Login').attr('disabled',false);    
                    //$('.success-signup-msg').text('There is some technical issue, Please try again later');
                }
            });
        });

        
        $('#mainContainer').on('click','.addToCart',function(){
            var orderedQuantityObject = $(this).parent().parent().find('.orderQuantity');
            var orderedQuantity = $(orderedQuantityObject).val();
            var availableQuantity = $(this).parent().parent().find('.inventoryQuantity').text();
            var price = $(this).parent().parent().find('.price').text();
            var cart = {
                inventoryid: $(this).attr('data-inventoryid'),
                retailerid: $(this).attr('data-retailerid'),
                inventoryname: $(this).parent().parent().find('.inventoryname').text(),
                retailername: $('.retailer-name').text(),
                price: Number(price),
                qty: Number(orderedQuantity)
            };

            var cartValue = JSON.parse( sessionStorage.getItem( "cart") );
          
            if(Number(orderedQuantity) <= Number(availableQuantity)){
                if(cartValue == null){
                    sessionStorage.setItem( "cart", '['+JSON.stringify( cart )+']' );
                    $('.cart-count').text('1');
                }else{
                    cartValue.push(cart);
                    sessionStorage.setItem( "cart", JSON.stringify( cartValue ) );
                    $('.cart-count').text( JSON.parse( sessionStorage.getItem( "cart") ).length  );
                }
                $(orderedQuantityObject).attr('disabled',true);
                $(this).text('Remove from cart');
            }else{
                alert("invalid data");
            }

            console.log(JSON.parse( sessionStorage.getItem( "cart") ));   
        });
        
        $('#mainContainer').on('click','.view-cart',function(){
            $('#viewCartDetails').css('display','block');
            $('#viewCartTable tbody').html('');
            var cartValue = JSON.parse( sessionStorage.getItem( "cart") );
            var cartDetails;
            
            if(cartValue != null){
                for(var i=0;i<cartValue.length;i++){
                    cartDetails += '<tr><td>'+cartValue[i].retailername+'</td><td>'+cartValue[i].inventoryname+'</td><td>'+cartValue[i].price+'</td><td>'+cartValue[i].qty+'</td><td><a data-id="'+cartValue[i].inventoryid+'" class="deleteinventoryfromcart" href="#" title="Delete" >Remove</a></td></tr>';  
                }

               
            } 
             $('#viewCartTable tbody').html(cartDetails);
                $('#viewCartDetails').css('display','block');
                $('#viewCartTable').DataTable();
            
        });    
        
        $('#mainContainer').on('click','.place-order',function(){
            $('#loader').css('display','block');   
            $.ajax({
                url:'/orderInventory',
                type:'POST',
                data:'orders='+sessionStorage.getItem( "cart"),
                success:function(data){
                    $('#loader').css('display','none');
                    if(JSON.parse(data).sucess==true){
                       sessionStorage.removeItem('cart');
                       $('#viewCartDetails').css('display','none');
                    }else{
                       
                    }
                },
                error:function(error){
                    //$('#loginButton').text('Login').attr('disabled',false);    
                    //$('.success-signup-msg').text('There is some technical issue, Please try again later');
                }
            });
        });

        /*$('#mainContainer').on('click','.orderInventory',function(){
            $.ajax({
                url:'/orderInventory',
                type:'POST',
                data:'retailerid='+$(this).attr('data-retailerid')+'&inventoryid='+$(this).attr('data-inventoryid')+'&quantity='+$('#orderQuantity').val()+'&price='+$(this).parent().parent().find('.price').text(),
                success:function(data){
                    if(JSON.parse(data).sucess==true){
                       $('.add-records').remove();
                    }else{
                        //$('#loginButton').text('Submit').attr('disabled',false);    
                        //$('.success-signup-msg').text(JSON.parse(data).msg);
                    }
                },
                error:function(error){
                    //$('#loginButton').text('Login').attr('disabled',false);    
                    //$('.success-signup-msg').text('There is some technical issue, Please try again later');
                }
            });
        });*/

        $('#mainContainer').on('click','.hospitals-ongoing-orders',function(){ 
            $('#loader').css('display','block');   
            $.ajax({
                url:'/viewHospitalsOngoingOrders',
                type:'POST',
                success:function(data){
                    if(JSON.parse(data).sucess==true){
                        $('#loader').css('display','none');
                        var receivedJson = JSON.parse(data).onGoingOrders;
                        var receivedJsonData = JSON.parse(receivedJson);
                        var onGoingOrders='';

                        for(var i=0;i<receivedJsonData.length;i++){
                            var action = '<a href="#">Cancel Order</a>';
                            if($.trim(receivedJsonData[i].STATUS) == 'PROCESSED'){
                                action = '<a data-orderid="'+receivedJsonData[i].ORDERID+'" data-hospitalidid="'+receivedJsonData[i].HOSPITAL_USERID+'" data-retaileruserid="'+receivedJsonData[i].RETAILER_USERID+'" data-inventoryid="'+receivedJsonData[i].INVENTORYID+'" href="#" class="acknowledge-order">Acknowledge Delivery</a>';                                
                            }
                            onGoingOrders += '<tr><td class="inventoryname">'+receivedJsonData[i].INVENTORYNAME+'</td><td>'+receivedJsonData[i].ORGNAME+'</td><td class="inventoryQuantity">'+receivedJsonData[i].QUANTITY+'</td><td class="price">'+receivedJsonData[i].TOTALPRICE+'</td><td>'+receivedJsonData[i].STATUS+'</td><td>'+action+'</td></tr>'; 
                        }
                                               
                        $('#ongoingOrdersTable tbody').html(onGoingOrders);
                        $('#ongoingOrdersTable').DataTable();
                        
                    }else{
                        //$('#loginButton').text('Submit').attr('disabled',false);    
                        //$('.success-signup-msg').text(JSON.parse(data).msg);
                    }
                },
                error:function(error){
                }
            });
        });
        $('#mainContainer').on('click','.acknowledge-order',function(){
            $('#loader').css('display','block');
            $.ajax({
                url:'/acknowledgeDelivery',
                type:'POST',
                data:'orderid='+$(this).attr('data-orderid')+'&hospitalidid='+$(this).attr('data-hospitalidid')+'&retaileruserid='+$(this).attr('data-retaileruserid')+'&inventoryid='+$(this).attr('data-inventoryid'),
                success:function(data){
                    if(JSON.parse(data).sucess==true){
                        $('#loader').css('display','none');
                        var receivedJson = JSON.parse(data).onGoingOrders;
                        var receivedJsonData = JSON.parse(receivedJson);
                        var onGoingOrders='';

                        for(var i=0;i<receivedJsonData.length;i++){
                            var action = '<a href="#">Cancel Order</a>';
                            if($.trim(receivedJsonData[i].STATUS) == 'PROCESSED'){
                                action = '<a data-orderid="'+receivedJsonData[i].ORDERID+'" data-hospitalidid="'+receivedJsonData[i].HOSPITAL_USERID+'" data-retaileruserid="'+receivedJsonData[i].RETAILER_USERID+'" data-inventoryid="'+receivedJsonData[i].INVENTORYID+'" href="#" class="acknowledge-order">Acknowledge Delivery</a>';                                
                            }
                            onGoingOrders += '<tr><td class="inventoryname">'+receivedJsonData[i].INVENTORYNAME+'</td><td>'+receivedJsonData[i].ORGNAME+'</td><td class="inventoryQuantity">'+receivedJsonData[i].QUANTITY+'</td><td class="price">'+receivedJsonData[i].TOTALPRICE+'</td><td>'+receivedJsonData[i].STATUS+'</td><td>'+action+'</td></tr>'; 
                        }
                                               
                        $('#ongoingOrdersTable tbody').html(onGoingOrders);
                        onGoingOrders != '' ? $('#ongoingOrdersTable').DataTable() : '';
                    }else{
                    }
                },
                })
            });

        $('#mainContainer').on('click','.hospitals-order-history',function(){ 
            $('#loader').css('display','block');   
            $.ajax({
                url:'/viewHospitalsOrderHistory',
                type:'POST',
                success:function(data){
                    $('#loader').css('display','none');
                    if(JSON.parse(data).sucess==true){
                        var receivedJson = JSON.parse(data).ordersHistory;
                        var receivedJsonData = JSON.parse(receivedJson);
                        var orderHistory='';

                        for(var i=0;i<receivedJsonData.length;i++){
                            orderHistory += '<tr><td class="inventoryname">'+receivedJsonData[i].INVENTORYNAME+'</td><td>'+receivedJsonData[i].ORGNAME+'</td><td class="inventoryQuantity">'+receivedJsonData[i].QUANTITY+'</td><td class="price">'+receivedJsonData[i].TOTALPRICE+'</td><td>'+receivedJsonData[i].STATUS+'</td></tr>'; 
                        }
                                               
                        $('#hospitalOrderHistory tbody').html(orderHistory);
                        $('#hospitalOrderHistory').DataTable();
                        
                    }else{
                        //$('#loginButton').text('Submit').attr('disabled',false);    
                        //$('.success-signup-msg').text(JSON.parse(data).msg);
                    }
                },
                error:function(error){
                }
            });
        })
        
        $('#mainContainer').on('click','.retailers-upcoming-orders',function(){
            $('#loader').css('display','block');    
            $.ajax({
                url:'/viewRetailersUpcomingOrders',
                type:'POST',
                success:function(data){
                    $('#loader').css('display','none');
                    if(JSON.parse(data).sucess==true){
                        var receivedJson = JSON.parse(data).onGoingOrders;
                        var receivedJsonData = JSON.parse(receivedJson);
                        var upComingOrders='';

                        for(var i=0;i<receivedJsonData.length;i++){
                            var action = '<a data-orderid="'+receivedJsonData[i].ORDERID+'" data-hospitalidid="'+receivedJsonData[i].HOSPITAL_USERID+'" data-retaileruserid="'+receivedJsonData[i].RETAILER_USERID+'" data-inventoryid="'+receivedJsonData[i].INVENTORYID+'" href="#" class="approve-order">Approve Order</a>';
                            if($.trim(receivedJsonData[i].STATUS) == 'PROCESSED'){
                                action = '<a data-orderid="'+receivedJsonData[i].ORDERID+'" data-hospitalidid="'+receivedJsonData[i].HOSPITAL_USERID+'" data-retaileruserid="'+receivedJsonData[i].RETAILER_USERID+'" data-inventoryid="'+receivedJsonData[i].INVENTORYID+'" href="#" class="cancel-order">Cancel Order</a>';                                
                            }

                            upComingOrders += '<tr><td class="inventoryname">'+receivedJsonData[i].INVENTORYNAME+'</td><td>'+receivedJsonData[i].ORGNAME+'</td><td class="inventoryQuantity">'+receivedJsonData[i].QUANTITY+'</td><td class="price">'+receivedJsonData[i].TOTALPRICE+'</td><td>'+receivedJsonData[i].STATUS+'</td><td>'+action+'</td></tr>';

                        }
                                               
                        $('#upComingOrdersTable tbody').html(upComingOrders);
                        $('#upComingOrdersTable').DataTable();
                        
                    }else{
                        //$('#loginButton').text('Submit').attr('disabled',false);    
                        //$('.success-signup-msg').text(JSON.parse(data).msg);
                    }
                },
                error:function(error){
                }
            });
        })
        $('#mainContainer').on('click','.retailers-order-history',function(){    
            $('#loader').css('display','block');
            $.ajax({
                url:'/viewRetailersOrderHistory',
                type:'POST',
                success:function(data){
                    $('#loader').css('display','none');
                    if(JSON.parse(data).sucess==true){
                        var receivedJson = JSON.parse(data).ordersHistory;
                        var receivedJsonData = JSON.parse(receivedJson);
                        var orderHistory='';

                        for(var i=0;i<receivedJsonData.length;i++){
                            orderHistory += '<tr><td class="inventoryname">'+receivedJsonData[i].INVENTORYNAME+'</td><td>'+receivedJsonData[i].ORGNAME+'</td><td class="inventoryQuantity">'+receivedJsonData[i].QUANTITY+'</td><td class="price">'+receivedJsonData[i].TOTALPRICE+'</td><td>'+receivedJsonData[i].STATUS+'</td></tr>'; 
                        }
                                               
                        $('#retailerOrderHistory tbody').html(orderHistory);
                        $('#retailerOrderHistory').DataTable();
                        
                    }else{
                        //$('#loginButton').text('Submit').attr('disabled',false);    
                        //$('.success-signup-msg').text(JSON.parse(data).msg);
                    }
                },
                error:function(error){
                }
            });
        })

        
        $('#mainContainer').on('click','.approve-order',function(){
            $('#loader').css('display','block');
            $.ajax({
                url:'/approveOrders',
                type:'POST',
                data:'orderid='+$(this).attr('data-orderid')+'&hospitalidid='+$(this).attr('data-hospitalidid')+'&retaileruserid='+$(this).attr('data-retaileruserid')+'&inventoryid='+$(this).attr('data-inventoryid'),
                success:function(data){
                    $('#loader').css('display','none');
                    if(JSON.parse(data).sucess==true){
                        var receivedJson = JSON.parse(data).onGoingOrders;
                        var receivedJsonData = JSON.parse(receivedJson);
                        var upComingOrders='';

                        for(var i=0;i<receivedJsonData.length;i++){
                            //alert(receivedJsonData[i].STATUS);
                            var action = '<a data-orderid="'+receivedJsonData[i].ORDERID+'" data-hospitalidid="'+receivedJsonData[i].HOSPITAL_USERID+'" data-retaileruserid="'+receivedJsonData[i].RETAILER_USERID+'" data-inventoryid="'+receivedJsonData[i].INVENTORYID+'" href="#" class="approve-order">Approve Order</a>';
                            if($.trim(receivedJsonData[i].STATUS) == 'PROCESSED'){
                                action = '<a data-orderid="'+receivedJsonData[i].ORDERID+'" data-hospitalidid="'+receivedJsonData[i].HOSPITAL_USERID+'" data-retaileruserid="'+receivedJsonData[i].RETAILER_USERID+'" data-inventoryid="'+receivedJsonData[i].INVENTORYID+'" href="#" class="cancel-order">Cancel Order</a>';                                
                            }

                            upComingOrders += '<tr><td class="inventoryname">'+receivedJsonData[i].INVENTORYNAME+'</td><td>'+receivedJsonData[i].ORGNAME+'</td><td class="inventoryQuantity">'+receivedJsonData[i].QUANTITY+'</td><td class="price">'+receivedJsonData[i].TOTALPRICE+'</td><td>'+receivedJsonData[i].STATUS+'</td><td>'+action+'</td></tr>'; 
                        }
                                               
                        $('#upComingOrdersTable tbody').html(upComingOrders);
                        upComingOrders != '' ? $('#upComingOrdersTable').DataTable() : '';

                    }else{
                    }
                },
                error:function(error){
                    //$('#loginButton').text('Login').attr('disabled',false);    
                    //$('.success-signup-msg').text('There is some technical issue, Please try again later');
                }
            });
        });
        $(document).on('click','li.menu-item-has-children',function(){
            $('li.menu-item-has-children').removeClass('item-selected');
            $(this).addClass('item-selected');

        });
        $(document).on('click','.nav-link',function(){
            // $('.common-dashboard-heading').html($(this)[0].getAttribute('href').replace('#','').replace('-',' ').toUpperCase() + ' TABLE');

        });
        $(document).on('click','.mymenutoggle',function(event){
            $('body').toggleClass('open');
        });

        
    });
})(window, document);
