//sandbox
var dataJSON = {
  "small": {
    "question": "What does the election mean for Brexit and what does Brexit mean for the election?",
    "answer": "It is unlikely that the result will affect Brexit, with both Tories and Labour saying they will enact the referendum result, though if Labour wins we might be more likely to see a soft Brexit as opposed to a hard one."
  },
  "large": {
    "question": "What does the election mean for Brexit and what does Brexit mean for the election?",
    "answer": "It is unlikely that the result will affect Brexit, with both Tories and Labour saying they will enact the referendum result, though if Labour wins we might be more likely to see a soft Brexit as opposed to a hard one.<br> A number of MPs campaigned differently from the way their constituency voted, for example the Labour MP for Vauxhall, Kate Hoey, who backed Brexit, while only 22% of her constituents voted to leave. While nationally Labour campaigned for remain, many traditionally Labour constituencies voted to leave. How this plays out in the general election remains to be seen."
  }
}

var ReceiverConsumer = Oasis.Consumer.extend({
  requests: {
    receive: function(mode) {
      // console.log(mode, "mode")
      let dim = getData(mode)
      // console.log(dim, "dim")
      return dim;
    }
  },
  events: {
    resize_content: function(mode){
      let w_h = getData(mode);
      this.send('resize_frame', w_h)
    }
  }
});

oasis.connect({
  consumers: {
    receive: ReceiverConsumer
  }
})

function getData(mode) {
  document.getElementById("explainer_question").innerHTML = dataJSON[mode].question;
  document.getElementById("explainer_answer").innerHTML = dataJSON[mode].answer;
  var h = document.getElementById("pyk_embed_container").offsetHeight
  // console.log(h, "hhhhh")
  // return {width: dataJSON[mode].width, height: dataJSON[mode].height};
  return {width: '100%', height: h};
}