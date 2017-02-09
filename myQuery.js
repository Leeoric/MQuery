
(function (window, undefined) {
	function myQuery(html) {
		return new myQuery.fn.init(html);
	}

	//Borrow the method of Array's prototype.
	var push = Array.prototype.push;
	var slice = Array.prototype.slice;
	//Prototype Object
	myQuery.fn = myQuery.prototype = {
		constructor: myQuery,
		// The default length of a myQuery object is 0
		length: 0,
		init: function (html) {
			this.events = {};
			if (html == null || html == "") {
				return this;
			}
			if (typeof html === "function") {
				var oldonload = window.onload;
				if (typeof oldonload != "function") {
					window.onload = html;
				} else {
					window.onload = function () {
						oldonload();
						html();
					}
				}
			}
			if (html && html.type === "myQuery") {
				push.apply(this, html);
				this.selector = html.selector;
				this.events = html.events;
				return;
			}
			if (myQuery.isString(html)) {
				//if string
				if (/^</.test(html)) {
					push.apply(this, myQuery.fn.parseHTML(html));
				} else {
					//if selector
					push.apply(this, myQuery.select(html));
					this.selector = html;
				}
			}
			//If the param is a DOM
			if (html.nodeType) {
				this[0] = html;
				this.length = 1;
			}

		},
		selector: "",//it's named used the selector
		type: "myQuery",
		toArray: function () {
			// var res = [];
			// for (var i = 0; i < this.length; i++) {
			// 	res.push(this[i]);
			// }
			// return res;
			return slice.call(this);
		},
		// Get the Nth element in the matched element set OR
		// Get the whole matched element xset as a clean array
		get: function (index) {
			// Return all the elements in a clean array
			if (index == null) {
				return this.toArray();
			}
			// Return just the one element from the set
			return index < 0 ? this[index + this.length] : this[index];
		},
		eq: function (num) {
			var dom;
			if (num >= 0) {
				dom = this.get(num);
			} else {
				dom = this.get(this.length + num);
			}
			return this.constructor(dom);
		},
		// Execute a callback for every element in the matched set.
		each: function (callback) {
			return myQuery.each(this, callback);
		},
		map: function (func) {
			return myQuery.map(this, func);
		},
		parseHTML: function () {
			var div = document.createElement("div");

			function parseHTML(html) {
				div.innerHTML = html;
				var res = [];
				for (var i = 0; i < div.childNodes.length; i++) {
					res.push(div.childNodes[i]);
				}
				div.innerHTML = "";
				return res;
			}

			return parseHTML;
		}
	};
	//Let init.prototype also have the method of myQuery.prototype
	myQuery.fn.init.prototype = myQuery.prototype;
	//module extended
	myQuery.extend = myQuery.prototype.extend = function (obj) {
		for (var k in obj) {
			this[k] = obj[k];
		}
	};

	//Tools module
	myQuery.extend({
		isString: function (data) {
			return typeof data === "string";
		},
		isDom: function (data) {
			if (data.nodeType) return true;
			return false;
		},
		prependChild: function (parent, element) {
			parent.insertBefore(element, parent.firstChild);
		},
		isObject: function (obj) {
			return typeof obj === "object";
		},
		getStyle: function (dom, name) {
			if (dom.currentStyle) {
				return dom.currentStyle[name];
			} else {
				return window.getComputedStyle(dom)[name];
			}
		},
		getClass: function (elem) {
			return elem.getAttribute && elem.getAttribute("class") || "";
		},
		getTxt: function (node, list) {
			var arr = node.childNodes;
			for (var i = 0; i < arr.length; i ++) {}
			if (arr[i].nodeType === 3) {
				list.push(arr[i]);
			}
			if (arr[i].nodeType ===1) {
				getTxt(arr[i], list);
			}
		}
	});

	//DOM module
	myQuery.extend({
		each: function (arr, func) {
			if (arr instanceof Array || arr.length >= 0) {
				for (var i = 0; i < arr.length; i++) {
					func.call(arr[i], i, arr[i]);
				}
			} else {
				for (i in arr) {
					func.call(arr[i], i, arr[i]);
				}
			}
			return arr;
		},
		map: function (arr, func) {
			var res = [], tmp;
			if (arr instanceof Array || arr.length >= 0) {
				for (var i = 0; i < arr.length; i++) {
					tmp = func(arr[i], i);
					if (tmp != null) {
						res.push(tmp);
					}
				}
			} else {
				for (i in arr) {
					tmp = func(arr[i], i);
					if (tmp != null) {
						res.push(tmp);
					}
				}
			}
			return res;
		}

	});

	//DOM Methods
	myQuery.fn.extend({
		appendTo: function (dom) {
			for (var i = 0; i < this.length; i++) {
				dom.appendChild(this[i]);
			}
		},
		append: function (selector) {

			this.constructor(selector).appendTo(this);

			return this;
		},
		prependTo: function (selector) {
			var iObj = this.constructor(selector);
			var newObj = this.constructor();
			for (var i = 0; i < this.length; i++) {
				for (var j = 0; j < iObj.length; j++) {
					var temp =
						i == this.length - 1 && j == iObj.length - 1 ? this[i]
							: this[i].cloneNode(true);

					[].push.call(newObj, temp);
					prependChild(iObj[j], temp);
				}
			}
			return newObj;
		},
		prepend: function (selector) {
			this.constructor(selector).prependTo(this);
			return this;
		}
	});
	//event handle
	myQuery.fn.extend({
		on: function (type, fn) {
			if (!this.events[type]) {
				this.events[type] = [];
				var that = this;
				this.each(function () {
					var f = function () {
						for (var i = 0; i < that.events[type].length; i++) {
							that.events[type][i]();
						}
					};
					if (this.addEventListener) {
						this.addEventListener(type, f);
					} else {
						this.attachEvent("on" + type, f);
					}
				});
			}
			this.events[type].push(fn);
			return this;
		},
		off: function (type, fn) {
			var arr = this.events[type];
			if (arr) {
				for (var i = 0; i < arr.length; i++) {
					if (arr[i] == fn) {
						break;
					}
				}
				if (i != arr.length) {
					arr.splice(i, 1);
				}
			}
			return this;
		},
		hover: function (func1, func2) {
			return this.mouseover(func1).mouseout(func2);
		},
		toggle: function () {
			var i = 0;
			var args = arguments;
			this.on("click", function (e) {
				args[i % args.length].call(this, e);
				i++;
			});
		}
	});
	//styles handle
	myQuery.fn.extend({
		css: function (option) {
			var args = arguments,
				len = args.length;
			if (len === 2) {
				if (myQuery.isString(args[0]) && myQuery.isString(args[1])) {
					return this.each(function () {
						this.style[args[0]] = args[1];
					});
				}
			} else if (len === 1) {
				if (myQuery.isString(option)) {
					return this[0].style[option] || myQuery.getStyle(this[0], option);
				} else if (typeof option == "object") {
					return this.each(function () {
						for (var k in option) {
							this.style[k] = option[k];
						}
					});
				}
			}
		},
		addClass: function (value) {
			this.each(function () {
				var classTxt = myQuery.getClass(this);
				if (classTxt) {
					if ((" " + classTxt + " ").indexOf(" " + name + " ") == -1) {
						//正常跳出，没找到
						this.className += " " + value;
					}
				} else {
					this.className = value;
				}
			});
		},
		removeClass: function (name) {
			return this.each(function () {
				var classTxt = " " + myQuery.getClass(this) + " ";
				// if (classTxt) {
				// 	var arr = classTxt.split(" ");
				// 	for (var i = arr.length - 1; i >=0; i--) {
				// 		if (arr[i] === name) {
				// 			arr.splice(i, 1);
				// 		}
				// 	}
				// 	this.className = arr.join(" ");
				// }
				var rclassName = new RegExp(" " + name + " ", 'g');
				classTxt.replace(rclassName, ' ')
					.replace(/\s+/g, ' ')
					.trim();
			});
		},
		hasClass: function (name) {
			for (var i = 0; i < this.length; i++) {
				if ((" " + this[i].className + " ").indexOf(" " + name + " ") != -1) {
					return true;
				}
			}
			return false;
		},
		toggleClass: function (name) {
			if (this.hasClass(name)) {
				this.removeClass(name);
			} else {
				this.addClass(name);
			}
			return this;
		}
	});
	//prop handle
	myQuery.fn.extend({
		attr: function (name, value) {
			if (arguments.length == 2 && value != undefined) {
				if (myQuery.isString(name) && myQuery.isString(value)) {
					return this.each(function () {
						this.setAttribute(name, value);
					});
				}
			} else {
				if (myQuery.isString(name)) {
					return this[0].getAttribute(name);
				}
			}
			return this;
		},
		prop: function (name, value) {
			if (arguments.length == 2 && value != undefined) {
				if (myQuery.isString(name) && myQuery.isString(value)) {
					return this.each(function () {
						this[name] = value;
					});
				}
			} else {
				if (myQuery.isString(name)) {
					return this[0][name];
				}
			}
			return this;
		},
		val: function (value) {
			return this.attr("value", value);
		},
		html: function (html) {
			return this.prop("innerHTML", html);
		},
		text: function (txt) {
			if (arguments) {
				return this.each(function () {
					this.innerHTML = "";
					this.appendChild(document.createTextNode(txt + " "));
				});
			} else {
				var arr = [];
				myQuery.getTxt(this[0], arr);
				return arr.join(" ");
			}
			return this;
		}
	});
	//animate module
	myQuery.fn.extend({
		animate: function () {
			//TODO animate module
		}
	});



	var select = (function () {
		var push = Array.prototype.push;
		try {
			var div = document.createElement("div");
			div.innerHTML = "<p></p>";
			var arr = [];
			push.apply(arr, div.getElementsByTagName("p"));
		} catch (e) {
			push = {
				apply: function (arr1, arr2) {
					for (var i = 0; i < arr2.length; i++) {
						arr1[arr1.length] = arr2;
					}
				}
			};
		}
		//test method
		var rnative = /\{\s*\[native/;
		var rtrim = /^\s+|\s+$/g;
		var rbaseselector = /^(?:\#([\w\-]+)|\.([\w\-]+)|(\*)|(\w+))$/;
		var support = {
			trim: rnative.test(String) + "",
			getElementsByClassName: rnative.test(document.getElementsByClassName + ""),
			indexOf: rnative.test(Array.prototype.indexOf + "")
		};

		function getByClassName(className, node) {
			node = node || document;
			if (support.getElementsByClassName) {
				return node.getElementsByClassName(className);
			} else {
				var allElement = document.getElementsByTagName("*");
				var classArr = [];
				for (var i = 0; i < allElement.length; i++) {
					if (" " + allElement[i].className + " " == " " + className + " ") {
						classArr.push(allElement[i]);
					}
				}
				return classArr;
			}
		}

		function myTrim(str) {
			if (support.trim) {
				return str.trim();
			} else {
				return str.replace(rtrim, "");
			}
		}

		function myIndexOf(array, search, starIndex) {
			starIndex = starIndex || 0;
			if (support.indexOf) {
				return array.indexOf(search, starIndex);
			} else {
				for (var i = starIndex; i < array.length; i++) {
					if (array[i] === search) {
						return i;
					}
				}
				return -1;
			}
		}

		function unique(array) {
			var resArray = [];
			for (var i = 0; i < array.length; i++) {
				if (myIndexOf(resArray, array[i] == -1)) {
					resArray.push(array[i]);
				}
			}
			return resArray;
		}

		function baseSelect(selector, node) {
			node = node || document;
			var m, res;
			if (m = rbaseselector.exec(selector)) {
				if (m[1]) {
					//id
					res = document.getElementById(m[1]);
					if (res) {
						return [res];
					} else {
						return [];
					}
				} else {
					if (m[2]) {	//.class
						return getByClassName(m[2], node);
					} else if (m[3]) {	//*
						return node.getElementsByTagName(m[3]);
					} else if (m[4]) {	//element
						return node.getElementsByTagName(m[4]);
					}
				}
				return [];
			}
		}

		function select2(selector, results) {
			results = results || [];
			var selectors = selector.split(" ");
			var arr = [],
				node = [document];
			for (var j = 0; j < selectors.length; j++) {
				for (var i = 0; i < node.length; i++) {
					push.apply(arr, baseSelect(selector, node));
				}
				node = arr;
				arr = [];
			}
			push.apply(results, node);
			return results;
		}

		function select(selector, results) {
			results = results || [];
			var selectors, subselector;
			if (typeof selector != "string") return results;
			if (support.qsa) {
				push.apply(results, document.querySelectorAll(selector));
			} else {
				selectors = selector.split(",");
				for (var i = 0; i < selectors.length; i++) {
					subselector = myTrim(selectors[i]);
					if (rbaseselector.test(subselector)) {
						push.apply(results, baseSelect(subselector));
					} else {
						select2(subselector, results);
					}
				}
			}
			return unique(results);
		}

		return select;
	})();
	myQuery.select = select;
	//expose
	window.myQuery = window.M = myQuery;
})(window);