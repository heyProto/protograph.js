//environment
window.ProtoEmbed = window.ProtoEmbed || {};

ProtoEmbed.initFrame = function (element, url, mode) {
  if(typeof element == "string"){
    element = document.getElementById(element);
  }
  element.removeChild(element.querySelector("blockquote"));

  var ResizeService = Oasis.Service.extend({
    initialize: function() {
      this.request('receive', mode).then(function (data) {
        resizeIframe(element.querySelector("iframe"), data);
      });
    },
    events: {
      resize_frame: function(data){
        resizeIframe(element.querySelector("iframe"), data);
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
  sandbox.el.setAttribute("sandbox", "allow-popups allow-scripts allow-same-origin")
  element.append(sandbox.el);
  element.querySelector("iframe").style.width = '100%';
  element.querySelector("iframe").style.height = 'auto';
  element.querySelector("iframe").style.borderWidth = '0px'

  function resizeIframe(obj, data) {
    // console.log(obj, data, "iframe object")
    if (data !== undefined) {
      // obj[0].style.height = obj.context.body.scrollHeight + 'px';
      obj.style.height = data.height + 'px';
      obj.style.width = '100%';
    }
  }
}