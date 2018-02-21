window.ProtoEmbed = window.ProtoEmbed || {};
ProtoEmbed.initFrame = function(element, url, mode, options) {
    if (typeof element == "string") {
        element = document.getElementById(element)
    }
    var blockquote = element.querySelector("blockquote");
    if (blockquote) {
        element.removeChild(blockquote);
    }
    var ResizeService = Oasis.Service.extend({
        initialize: function() {
            var that = this;
            setTimeout(function(){
                that.send("get_size");
            }, 1000);
            this.request('receive', mode, options).then(function(data) {
                resizeIframe(element.querySelector("iframe"), data)
            })
        },
        events: {
            resize_frame: function(data) {
                resizeIframe(element.querySelector("iframe"), data)
            }
        }
    });
    var sandbox = oasis.createSandbox({
        url: url,
        type: 'html',
        capabilities: ['receive'],
        services: {
            receive: ResizeService
        }
    });
    sandbox.el.setAttribute("sandbox", "allow-popups allow-scripts allow-same-origin allow-presentation allow-top-navigation")
    element.appendChild(sandbox.el);
    element.querySelector("iframe").style.width = '100%';
    element.querySelector("iframe").style.height = 'auto';
    element.querySelector("iframe").style.borderWidth = '0px';
    element.querySelector("iframe").style.visibility = 'hidden';

    function resizeIframe(obj, data) {
        if (data !== undefined) {
            obj.style.height = data.height + 'px';
            obj.style.width = (typeof (data.width) !== undefined && data.width != 0) ? data.width : '100%';
            obj.style.visibility = 'visible';
        }
    }

    return {
        sandbox: sandbox
    }
}