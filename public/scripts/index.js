
var mediconn_rwd = window.mediconn_rwd || {};
mediconn_rwd.mediconn = (function(){
   var $doc = $(document);
   var mediconnApp = {
		init: function() {
		   mediconnApp.getallRetailersData();
		},
		getallRetailersData:function(){
		  $.ajax({
			type: 'GET',
			url : "/mediconn/json/retailerList.json",
			contentType: "application/json",
			cache : false,
			dataType: 'json',
			success: function(data) {
					   mediconnApp.populateTable(data.data);
					   mediconnApp.addEvents();
			},
			error: function(response) {
			   console.log('error');
			   mediconnApp.showTechDiffPage();
			}
		  });
		},
		populateTable:function(data){
			var receivedJsonData = data;
			var tableColumns = Object.keys(data[0]);
			var tableColumnLength = Object.keys(data[0]).length;
			var tableData = '';
			var tableBody = '<tbody>';
			var tableHeader = '<thead class="gradient"><tr>';
			var completeTableData = '';
			for(var j = 0 ; j < tableColumnLength;j++){
				tableHeader += '<th>'+tableColumns[j]+'</th>';
			}
			tableHeader += '<th>Actions</th></tr></thead>';
			for(var i=0; i < receivedJsonData.length;i++){
				var tr = '<tr>';
				for(var j = 0 ; j < tableColumns.length;j++){
					if(j == 0){
						tableBody += '<tr>';
					}
					tableBody += '<td>'+receivedJsonData[i][tableColumns[j]]+'</td>';
					if(j == tableColumns.length - 1){
						tableBody += '<td><a class="add" title="Add"><i class="material-icons">&#xE03B;</i></a><a class="edit" title="Edit"><i class="material-icons">&#xE254;</i></a><a class="delete" title="Delete"><i class="material-icons">&#xE872;</i></a></td></tr>';
					}
				}
				
			}
			completeTableData = tableHeader + tableBody;
			$('#retailers-table').append(completeTableData);
		},
		showTechDiffPage:function(){
		   $('#loader-container').addClass('hide').css('min-height','0');
		   $('.banner-container,.sticky-section,#promotions-disclaimer,.promotions-container .back-to-top').addClass('hide');
		   $('.promotions-container,.promotions-container .technical-diff-container').removeClass('hide');
		   sitecat.technicalError();
		},
		
	   addEvents:function(){
		var actions = $("table td:last-child").html();
		// Append table with add row form on add new button click
		$(".add-new").on('click',function(){
			$(this).attr("disabled", "disabled");
			var index = $("table tbody tr:last-child").index();
			var row = '<tr>' +
				'<td><input type="text" class="form-control" name="name" id="name"></td>' +
				'<td><input type="text" class="form-control" name="department" id="department"></td>' +
				'<td><input type="text" class="form-control" name="phone" id="phone"></td>' +
				'<td>' + actions + '</td>' +
			'</tr>';
			$("table").append(row);		
			$("table tbody tr").eq(index + 1).find(".add, .edit").toggle();
		});
		// Add row on add button click
		$(document).on("click", ".add", function(){
			var empty = false;
			var input = $(this).parents("tr").find('input[type="text"]');
			input.each(function(){
				if(!$(this).val()){
					$(this).addClass("error");
					empty = true;
				} else{
					$(this).removeClass("error");
				}
			});
			$(this).parents("tr").find(".error").first().focus();
			if(!empty){
				input.each(function(){
					$(this).parent("td").html($(this).val());
				});			
				$(this).parents("tr").find(".add, .edit").toggle();
				$(".add-new").removeAttr("disabled");
			}		
		});
		// Edit row on edit button click
		$(document).on("click", ".edit", function(){		
			$(this).parents("tr").find("td:not(:last-child)").each(function(){
				$(this).html('<input type="text" class="form-control" value="' + $(this).text() + '">');
			});		
			$(this).parents("tr").find(".add, .edit").toggle();
			$(".add-new").attr("disabled", "disabled");
		});
		// Delete row on delete button click
		$(document).on("click", ".delete", function(){
			$(this).parents("tr").remove();
			$(".add-new").removeAttr("disabled");
		});
	   }
   }
   return {
		   init: mediconnApp.init,
   };
}());

(function(){
   mediconn_rwd.mediconn.init();
})();
