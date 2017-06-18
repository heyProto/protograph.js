//environment
var ProtoEmbed = {};
ProtoEmbed.init = {};
ProtoEmbed.init = function (id, url, mode){
  // console.log(id, url, "------")
  // $(function(){
  //   $('#' +id + ' iframe').ready(function(){
  //     document.getElementById("cite").remove();
  //   });
  // });
  window.onload = function(){
    document.getElementById("cite").parentNode.removeChild(document.getElementById("cite"));
  }
  var ResizeService = Oasis.Service.extend({
    initialize: function() {
      this.request('receive', mode).then(function (data) {
        resizeIframe(document.querySelector('#' + id + ' iframe'), data)
      });
    },
    events: {
      resize_frame: function(data){
        resizeIframe(document.querySelector('#' + id + ' iframe'), data)
      }
    }
  });
  var sandbox = oasis.createSandbox({
    url: url,
    type: 'html',
    capabilities: [ 'receive' ],
    services: {
      receive: ResizeService
    }
  });
  document.getElementById(id).append(sandbox.el);
  document.querySelector('#' + id + ' iframe').style.width = '100%'
  document.querySelector('#' + id + ' iframe').style.height = 'auto'
  document.querySelector('#' + id + ' iframe').style.borderWidth = '0px'
  // $("#" +id).find('iframe').css({
  //   "width": '100%',
  //   "height": 'auto',
  //   'border-width': '0px'
  // })
  // document.getElementsByClassName("pyk-button").click(function(){
  //   let mode = this.id;
  //   oasis.services[0].send("resize_content", mode)
  // })
  function buttonClicked() {
    let mode = this.id;
    oasis.services[0].send("resize_content", mode)
  }

  var button_class = document.getElementsByClassName("pyk-button")
  for (let i=0; i<button_class.length; i++){
    button_class[i].setAttribute('style', 'background-color: white; border: 1px solid grey;color: black;padding: 5px;text-align: center;text-decoration: none;display: inline-block;font-size: 12px;cursor:pointer')
    button_class[i].addEventListener('click', buttonClicked)
  }

  function resizeIframe(obj, data) {
    // console.log(obj, data, "iframe object")
    if (data !== undefined) {
      // obj[0].style.height = obj.context.body.scrollHeight + 'px';
      obj.style.height = data.height + 'px';
      obj.style.width = '100%';
    }
  }
}