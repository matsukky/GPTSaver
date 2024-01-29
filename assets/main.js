let slides=[];  let timeoutId;
[...document.getElementsByClassName("splide")].forEach(splider => {
  splide = new Splide( `#${splider.id}`,  { pagination: false, updateOnMove: true, arrows: false, drag: false, start: splider.getElementsByClassName("splide__slide").length+1}).mount();
  slides[splider.id] = splide
   let val = 1;
  [...splider.getElementsByClassName("splide__slide")].forEach((slide, index) =>{
    if(slide.id.includes(`#splide${splider.id}`) || slide.id == "") return 
    const where = slide.getElementsByClassName("message")
    Array.from(where).forEach(element => {  
      const getParents = getAncestors(element, ".splide__track")
    if (getParents[0]?.id.replace("-track", "") != splider.id) return
  

      const indicator = document.createElement("div")
    indicator.classList = `indicator`

    if(slide.querySelector('.head') == element.querySelector('.head') ){
    const prev = document.createElement("button")
    prev.classList = `controlpages`
    prev.innerHTML = `◀`
    prev.disabled= val <= 1
    prev.id=`${splider.id}-prev`
    prev.onclick= function(){slides[splider.id].go( '<' ); changeHeight(splider.id, 2)}

    const next = document.createElement("button")
    next.classList = `controlpages`
    next.innerHTML = `▶`
    next.disabled = val >= slides[splider.id].length 
    next.id=`${splider.id}-next`
    next.onclick= function(){slides[splider.id].go( '>' ); changeHeight(splider.id, 0)}

    const pageindicator = document.createElement("div")
    pageindicator.classList = `pages`
    pageindicator.innerHTML = `${val} / ${splide.length}`
    
    indicator.appendChild(prev)
    indicator.appendChild(pageindicator)
    indicator.appendChild(next) 
    val++
    }  
    else {
      const up = document.createElement("button")
      up.classList = `controlpages`
      up.innerHTML = `▲`
      up.onclick= function(){slide.querySelector('.head').scrollIntoView();}
      indicator.appendChild(up)
    }
    element.querySelector('.head').appendChild(indicator)
    })
  })
})

function getAncestors(element, selector) {
      let ancestors = [];
      let parent = element.parentElement;
    
      while (parent) {
        if (parent.matches(selector)) ancestors.push(parent);
        parent = parent.parentElement;
      }
    
      return ancestors;
    }

    function generateRandomHexColor() {
      const [red, green, blue] = Array.from({ length: 3 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0'));
      return `#${red}${green}${blue}`;
    }
    

  function changeHeight(params, old) {
    const elem = slides[params]
    if(!elem) return console.error(`Element ${params} not found !`);
    if(!old) old=0
    const oldSlideValue = elem.index+old
    const newSlideValue = elem.index+1
    //console.log(params,newSlideValue,"➡️", elem.index+old);
    const track = document.getElementById(`${params}-track`)
    const newSlide = document.getElementById(`${params}-slide${newSlideValue < 10 ? '0' + newSlideValue.toString() : newSlideValue}`).getElementsByClassName("lists")[0] ||undefined;
    const newHeight = newSlide.offsetHeight - (oldSlideValue != newSlideValue ? 0 : 0)
    //console.table({"elem" :params, "change" : `${newSlideValue} ➡️ ${elem.index+old}`, "track" : track.offsetHeight, newHeight ,old, })
    //console.log(params, track, newSlide, newHeight);
    /* // DEV
    const color = generateRandomHexColor() 
    track.style.backgroundColor = color +"33"
    track.style.outlineColor = color;
    track.style.outlineWidth= ( new Float64Array(params.replace("splide", ""))+2) + "px";
    //END DEV */

    requestAnimationFrame(() => {
      track.style.height = `${newHeight+2}px`;
    });
    const parents = getAncestors(track, ".splide__track")

    if(parents.length >= 1) {
      const oldSlide = document.getElementById(`${params}-slide${oldSlideValue < 10 ? '0' + oldSlideValue.toString() : oldSlideValue}`).getElementsByClassName("lists")[0] ||undefined;
      parents.forEach(parent => {
        const parentName = parent?.id.replace("-track", "")
        //if(parentName == "splide1" && params == "splide3") return 
        const elemParent = slides[parentName]
        if(!elemParent) return console.error(`Parent of ${params} : ${parentName} not found !`);
        const newSlideParentValue = elemParent.index+1
        const trackParent = document.getElementById(`${parentName}-track`)
        const slideParent = document.getElementById(`${parentName}-slide${newSlideParentValue < 10 ? '0' + newSlideParentValue.toString() : newSlideParentValue}`).getElementsByClassName("lists")[0]
        const padding = parseInt(window.getComputedStyle(trackParent).paddingTop)
        const height = newHeight + slideParent.offsetHeight - (oldSlideValue != newSlideValue ? oldSlide.offsetHeight: oldSlide.offsetHeight + newHeight) + padding
        //console.table({[params] :parentName , "height" : height, "newHeight":newHeight, "slideParent" : slideParent.offsetHeight,"oldSlide": oldSlide.offsetHeight, "padding" : padding});
        requestAnimationFrame(() => {
          trackParent.style.height = `${height}px`
          //console.log(params, parentName, trackParent, height);
         });
        //console.log("trackParent",trackParent, "\nnewSlide", newSlide, "\nslideParent", slideParent, "\noldSlide", oldSlide);
      });
    
      setTimeout(function() {changeHeight(parents[parents.length-1]?.id.replace("-track", ""), 1)}, 500)
    }

  }

  window.addEventListener('load', async function() {
    speedSplideTrack(".01s")
    hljs.addPlugin(
      new CopyButtonPlugin({
        hook(l, o) {
          let { replace: e, replacewith: s } = o.dataset;
          return e && s ? l.replace(e, s) : l;
        },
        callback(l, o) {
          console.log(l);
        },
      })
    ),
      hljs.highlightAll();
    for (const [key] of Object.entries(slides).reverse())  {
      changeHeight(key, 1)
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    await new Promise(resolve => setTimeout(resolve, 100))
    speedSplideTrack(".25s")
    loading(false)
  });
  
 
window.addEventListener("resize", async function() {
  loading(true)
  speedSplideTrack(".01s")
    document.getElementsByClassName("app")[0].style.opacity = 0
  clearTimeout(timeoutId);
  timeoutId = setTimeout(async function() {
    console.log("Screen size change");
    for (const [key, slide] of Object.entries(slides).reverse()) {
      await new Promise(resolve => setTimeout(resolve, 100))
      slide.refresh();
      changeHeight(key, 1)
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    speedSplideTrack(".25s")
    loading(false)
  }, 200);
});


function loading(visible) {
  document.getElementsByClassName(`full wait`)[0].style.opacity = visible ? 1 : 0
  document.body.style.overflow = visible ? 'hidden' : 'auto';
  document.getElementsByClassName("app")[0].style.opacity = visible ? 0 : 1
}

function speedSplideTrack(time) {
  var splideTracks = document.querySelectorAll('.splide__track');
  splideTracks.forEach(function(splideTrack) {
    splideTrack.style.transitionDuration = time;
  });
}


const showOnPx = 125,
  backTop = document.getElementsByClassName("backtop")[0],
  scrollContainer = () => document.documentElement || document.body;
document.addEventListener("scroll", () => {
  scrollContainer().scrollTop > showOnPx
    ? backTop.classList.add("show")
    : backTop.classList.remove("show");
});

