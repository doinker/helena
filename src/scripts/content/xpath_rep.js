/**********************************************************************
 * Helper functions for making and handling xpath lists
 * (my easier to manipulate representation of xpaths)
 **********************************************************************/

var XPathList = (function() { var pub = {};

 pub.xPathToXPathList = function(xpath){
  var xpathList = [];
  for (var i = 0; i<xpath.length; i++){
    var char = xpath[i];
    if (char === "[") {
      var start = i;
      var end = start + 1;
      while (xpath[end] !== "]") {
        end += 1;
      }
      var prefix = xpath.slice(0,start); //don't include brackets
      var suffix = xpath.slice(end+1,xpath.length); //don't include brackets
      var slashIndex = prefix.lastIndexOf("/");
      var nodeName = prefix.slice(slashIndex+1,prefix.length);
      var index = xpath.slice(start+1,end);
      xpathList.push({"nodeName": nodeName, "index": index, "iterable": false});
    }
  }
  return xpathList;
}

pub.xPathMatch = function(xPathWithWildcards, xPath){
  if (xPathWithWildcards.length !== xPath.length){
    return false;
  }
  for (var i = 0; i < xPathWithWildcards.length; i++){
    var targetNode = xPathWithWildcards[i];
    var node = xPath[i];
    if (targetNode.nodeName !== node.nodeName){
      return false;
    }
    if (targetNode.iterable === false && targetNode.index !== node.index){
      return false;
    }
  }
  return true;
}

pub.xPathMerge = function(xPathWithWildcards, xPath){
  if (xPathWithWildcards.length !== xPath.length){
    return false;
  }
  for (var i = 0; i < xPathWithWildcards.length; i++){
    var targetNode = xPathWithWildcards[i];
    var node = xPath[i];
    if (targetNode.nodeName !== node.nodeName){
      return false;
    }
    if (targetNode.iterable === false && targetNode.index !== node.index){
      targetNode.iterable = true;
    }
  }
  return true;
}

pub.xPathReduction = function(xpath_list){
  if (xpath_list.length < 2){
    return xpath_list;
  }
  var xPathsWithWildcards = [];
  xPathsWithWildcards.push(xpath_list[0]);
  for (var i = 1; i < xpath_list.length; i++){
    var new_xpath = xpath_list[i];
    var success = false;
    for (var j = 0; j < xPathsWithWildcards.length; j++){
      var candidate_match = xPathsWithWildcards[j];
      success = xPathMerge(candidate_match, new_xpath);
      //in case of success, candidate_match will now contain the
      //updated, merged xpath
      if (success){
        break;
      }
    }
    if (!success){
      //since couldn't match the new xpath with existing xpaths, add it
      xPathsWithWildcards.push(new_xpath);
    }
  }
  return xPathsWithWildcards;
}

pub.xPathToString = function(xpath_list){
  var str = "";
  for (var i = 0; i < xpath_list.length; i++){
    var node = xpath_list[i];
    str += node.nodeName;
    if (node.iterable){
      str += "[*]/";
    }
    else {
      str += "["+node.index+"]/";
    }
  }
  //add the HTML back to the beginning, remove the trailing slash
  return "HTML/"+str.slice(0,str.length-1);
}

return pub;}());