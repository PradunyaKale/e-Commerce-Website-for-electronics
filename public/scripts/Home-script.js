const optionsFlex = document.querySelector('.opt.flex');
const opts = document.querySelector('.opts');

function showOpts() {
  opts.classList.add('show');
}

function hideOpts() {
  opts.classList.remove('show');
}

optionsFlex.addEventListener('mouseenter', showOpts);

optionsFlex.addEventListener('mouseleave', function(event) {
  if (!event.relatedTarget || !optionsFlex.contains(event.relatedTarget)) {
    hideOpts();
  }
});
opts.addEventListener('mouseenter', showOpts);

opts.addEventListener('mouseleave', function(event) {
  if (!event.relatedTarget || (!opts.contains(event.relatedTarget) && !optionsFlex.contains(event.relatedTarget))) {
    hideOpts();
  }
});

const scrollers = document.querySelectorAll(".sliding_apps");

if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
  addAnimation();
}

function addAnimation(){
  scrollers.forEach((sliding_apps) => {
    sliding_apps.setAttribute('data-animated', true);

    const scrollerInner = sliding_apps.querySelector(".scroller__inner");
    const scrollerContent = Array.from(scrollerInner.children);

    scrollerContent.forEach(item=>{
      const duplicatedItem = item.cloneNode(true);
      duplicatedItem.setAttribute("aria-hidden", true);
      scrollerInner.appendChild(duplicatedItem);
    })
  });
}

