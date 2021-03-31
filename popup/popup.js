
   var SelectPicker= $('.selectpicker');
$(function() {
$(".selectpicker option").prop("selected", "selected");
SelectPicker.selectpicker();
});

 $(function () {
    $('#btn').click(function () {
        var val = $("#addRow").val();
        var htm = '';
        htm += '<option>' + val + '</option>';
        $('.selectpicker').append(htm);
        $('.selectpicker').selectpicker('refresh');
    });
    /* $('#chkveg').multiselect({
    
        includeSelectAllOption: false
    
    }); */

});
 $(function () {
$('.selectpicker').on('changed.bs.select', function (e) {
   // check if no option is selected.
    if ($('.selectpicker').val().length < 1) {
      SelectPicker.selectpicker('val', 'Value of your desired option u wish to be selected');
    }
  });
  });


