# MP Tools Bookmarklet
```javascript
javascript:(function(){fetch('https://api.github.com/repos/SuperGamer474/MP-Tools/commits?path=script.js&per_page=1%27).then(function(r){return r.json()}).then(function(d){if(!d.length){console.error(%27No commits found%27);return;}var s=document.createElement(%27script%27);s.src=%27https://cdn.jsdelivr.net/gh/SuperGamer474/MP-Tools@%27+d[0].sha.substring(0,7)+%27/script.js%27;s.onload=function(){if(typeof MP_Tools===%27function%27)MP_Tools();else console.error(%27MP_Tools not found%27)};s.onerror=function(){console.error(%27Failed to load MP_Tools%27)};document.head.appendChild(s);}).catch(function(e){console.error(e)})})();
```
