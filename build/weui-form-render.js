/*
WeUI-formRender - https://github.com/freyo/WeUI-FormRender/
Version: 0.1.00
Author: Frey Hsiao <freyhsiao@gmail.com>
*/
'use strict';

(function ($) {
  'use strict';

  var Toggle = function Toggle(element, options) {

    var defaults = {
      theme: 'fresh',
      labels: {
        off: 'Off',
        on: 'On'
      }
    };

    var opts = $.extend(defaults, options),
        $kcToggle = $('<div class="kc-toggle"/>').insertAfter(element).append(element);

    $kcToggle.toggleClass('on', element.is(':checked'));

    var kctOn = '<div class="kct-on">' + opts.labels.on + '</div>',
        kctOff = '<div class="kct-off">' + opts.labels.off + '</div>',
        kctHandle = '<div class="kct-handle"></div>',
        kctInner = '<div class="kct-inner">' + kctOn + kctHandle + kctOff + '</div>';

    $kcToggle.append(kctInner);

    $kcToggle.click(function () {
      element.attr('checked', !element.attr('checked'));
      $(this).toggleClass('on');
    });
  };

  $.fn.kcToggle = function (options) {
    var toggle = this;
    return toggle.each(function () {
      var element = $(this);
      if (element.data('kcToggle')) {
        return;
      }
      var kcToggle = new Toggle(element, options);
      element.data('kcToggle', kcToggle);
    });
  };
})(jQuery);
'use strict';
// render the formBuilder XML into html

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function FormRenderFn(options, element) {

  var formRender = this,
      defaults = {
    destroyTemplate: true, // @todo
    container: false,
    dataType: 'xml',
    formData: false,
    label: {
      selectColor: 'Select Color',
      noFormData: 'No form data.',
      formRendered: 'Form Rendered'
    },
    render: true,
    notify: {
      error: function error(message) {
        return console.error(message);
      },
      success: function success(message) {
        return console.log(message);
      },
      warning: function warning(message) {
        return console.warn(message);
      }
    }
  },
      _helpers = {};

  var opts = $.extend(true, defaults, options);

  /**
   * Require the html element if it has been lost
   *
   * @return {object} javascript object for html element
   */
  _helpers.getElement = function () {
    if (!element.id) {
      element.id = _helpers.makeId(element);
    }

    return document.getElementById(element.id);
  };

  /**
   * Make an ID for this element using current date and tag
   *
   * @param  {Boolean} element
   * @return {String}  new id for element
   */
  _helpers.makeId = function (element) {
    var epoch = new Date().getTime();

    return element.tagName + '-' + epoch;
  };

  if (!opts.formData && element) {
    element = _helpers.getElement();
    opts.formData = element.value;
  }

  /**
   * Generate markup wrapper where needed
   *
   * @param  {string}              tag
   * @param  {String|Array|Object} content we wrap this
   * @param  {object}              attrs
   * @return {String}
   */
  _helpers.markup = function (tag) {
    var content = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
    var attrs = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var contentType = void 0,
        field = document.createElement(tag),
        getContentType = function getContentType(content) {
      return Array.isArray(content) ? 'array' : typeof content === 'undefined' ? 'undefined' : _typeof(content);
    },
        appendContent = {
      string: function string(content) {
        field.innerHTML = content;
      },
      object: function object(content) {
        return field.appendChild(content);
      },
      array: function array(content) {
        for (var i = 0; i < content.length; i++) {
          contentType = getContentType(content[i]);
          appendContent[contentType](content[i]);
        }
      }
    };

    for (var attr in attrs) {
      if (attrs.hasOwnProperty(attr)) {
        var name = _helpers.safeAttrName(attr);
        field.setAttribute(name, attrs[attr]);
      }
    }

    contentType = getContentType(content);

    if (content) {
      appendContent[contentType].call(this, content);
    }

    return field;
  };

  /**
   * Generate preview markup
   * @param  {object} field
   * @return {string}       preview markup for field
   * @todo
   */
  _helpers.fieldRender = function (field) {
    var fieldMarkup = '',
        fieldLabel = '',
        optionsMarkup = '';
    var fieldAttrs = _helpers.parseAttrs(field.attributes),
        fieldLabelText = fieldAttrs.label || '',
        fieldDesc = fieldAttrs.description || '',
        fieldRequired = '',
        fieldOptions = $('option', field);
    fieldAttrs.id = fieldAttrs.name;

    fieldAttrs.type = fieldAttrs.subtype || fieldAttrs.type;

    if (fieldAttrs.required) {
      fieldAttrs.required = null;
      fieldAttrs['aria-required'] = 'true';
      fieldRequired = '<span class="required">*</span>';
    }

    if (fieldAttrs.type !== 'hidden') {
      if (fieldDesc) {
        fieldDesc = '<span class="tooltip-element" tooltip="' + fieldDesc + '">?</span>';
      }
      fieldLabel = '<div class="weui_cell_hd"><label class="weui_label" for="' + fieldAttrs.id + '">' + fieldLabelText + ' ' + fieldRequired + ' ' + fieldDesc + '</label></div>';
    }

    var fieldLabelVal = fieldAttrs.label;

    delete fieldAttrs.label;
    delete fieldAttrs.description;

    var fieldAttrsString = _helpers.attrString(fieldAttrs);

    switch (fieldAttrs.type) {
      case 'textarea':
      case 'rich-text':
        delete fieldAttrs.type;
        delete fieldAttrs.value;
        fieldMarkup = '<div class="weui_cells_title">' + fieldLabelText + ' ' + fieldRequired + ' ' + fieldDesc + '</div>' + '<div class="weui_cells weui_cells_form"><div class="weui_cell"><div class="weui_cell_bd weui_cell_primary"><textarea class="weui_textarea" ' + fieldAttrsString + '></textarea></div></div></div>';
        break;
      case 'select':
        fieldAttrs.type = fieldAttrs.type.replace('-group', '');

        if (fieldOptions.length) {
          fieldOptions.each(function (index, el) {
            index = index;
            var optionAttrs = _helpers.parseAttrs(el.attributes),
                optionAttrsString = _helpers.attrString(optionAttrs);
            optionsMarkup += '<option ' + optionAttrsString + '>' + el.textContent + '</option>';
          });
        }
        fieldMarkup = '<div class="weui_cell weui_cell_select weui_select_after">' + fieldLabel + '<div class="weui_cell_bd weui_cell_primary"><select class="weui_select" ' + fieldAttrsString + '>' + optionsMarkup + '</select></div></div>';
        break;
      case 'checkbox-group':
        fieldAttrs.type = fieldAttrs.type.replace('-group', '');

        // delete fieldAttrs.className;

        if (fieldOptions.length) {
          (function () {
            var optionName = fieldAttrs.type === 'checkbox' ? fieldAttrs.name + '[]' : fieldAttrs.name;
            fieldOptions.each(function (index, el) {
              var optionAttrs = Object.assign({}, fieldAttrs, _helpers.parseAttrs(el.attributes)),
                  optionAttrsString = void 0;

              if (optionAttrs.selected) {
                delete optionAttrs.selected;
                optionAttrs.checked = null;
              }

              optionAttrs.name = optionName;
              optionAttrs.id = fieldAttrs.id + '-' + index;
              optionAttrsString = _helpers.attrString(optionAttrs);
              optionsMarkup += '<label class="weui_cell weui_check_label" for="' + optionAttrs.id + '"><div class="weui_cell_hd"><input class="weui_check" ' + optionAttrsString + ' /><i class="weui_icon_checked"></i></div><div class="weui_cell_bd weui_cell_primary"><p>' + el.textContent + '</p></div></label>';
            });
          })();
        }
        fieldMarkup = '<div class="' + fieldAttrs.type + '-group"><div class="weui_cells_title">' + fieldLabelText + ' ' + fieldRequired + ' ' + fieldDesc + '</div><div class="weui_cells weui_cells_checkbox">' + optionsMarkup + '</div></div>';
        break;	  
      case 'radio-group':
        fieldAttrs.type = fieldAttrs.type.replace('-group', '');

        // delete fieldAttrs.className;

        if (fieldOptions.length) {
          (function () {
            var optionName = fieldAttrs.type === 'checkbox' ? fieldAttrs.name + '[]' : fieldAttrs.name;
            fieldOptions.each(function (index, el) {
              var optionAttrs = Object.assign({}, fieldAttrs, _helpers.parseAttrs(el.attributes)),
                  optionAttrsString = void 0;

              if (optionAttrs.selected) {
                delete optionAttrs.selected;
                optionAttrs.checked = null;
              }

              optionAttrs.name = optionName;
              optionAttrs.id = fieldAttrs.id + '-' + index;
              optionAttrsString = _helpers.attrString(optionAttrs);
              optionsMarkup += '<label class="weui_cell weui_check_label" for="' + optionAttrs.id + '"><div class="weui_cell_bd weui_cell_primary"><p>' + el.textContent + '</p></div><div class="weui_cell_ft"><input class="weui_check" ' + optionAttrsString + ' /><span class="weui_icon_checked"></span></div></label>';
            });
          })();
        }
        fieldMarkup = '<div class="' + fieldAttrs.type + '-group"><div class="weui_cells_title">' + fieldLabelText + ' ' + fieldRequired + ' ' + fieldDesc + '</div><div class="weui_cells weui_cells_radio">' + optionsMarkup + '</div></div>';
        break;
      case 'text':
        fieldMarkup = '<div class="weui_cell">' + fieldLabel + '<div class="weui_cell_bd weui_cell_primary"><input class="weui_input" ' + fieldAttrsString + '></div></div>';
        break;	  
      case 'password':
	    fieldMarkup = '<div class="weui_cell">' + fieldLabel + '<div class="weui_cell_bd weui_cell_primary"><input class="weui_input" ' + fieldAttrsString + '></div></div>';
        break;
      case 'email':
	    fieldMarkup = '<div class="weui_cell">' + fieldLabel + '<div class="weui_cell_bd weui_cell_primary"><input class="weui_input" ' + fieldAttrsString + '></div></div>';
        break;
      case 'file':
	    fieldMarkup = '<div class="weui_cell"><div class="weui_cell_bd weui_cell_primary"><div class="weui_uploader"><div class="weui_uploader_hd weui_cell"><div class="weui_cell_bd weui_cell_primary">' + fieldLabelText + ' ' + fieldRequired + ' ' + fieldDesc + '</div></div><div class="weui_uploader_bd"><div class="weui_uploader_input_wrp"><input class="weui_uploader_input" ' + fieldAttrsString + '></div></div></div></div></div>';
        break;
      case 'hidden':
      case 'date':
	    fieldMarkup = '<div class="weui_cell">' + fieldLabel + '<div class="weui_cell_bd weui_cell_primary"><input class="weui_input" ' + fieldAttrsString + '></div></div>';
        break;
      case 'autocomplete':
        fieldMarkup = fieldLabel + ' <input ' + fieldAttrsString + '>';
        break;
      case 'color':
        fieldMarkup = fieldLabel + ' <input ' + fieldAttrsString + '> ' + opts.label.selectColor;
        break;
      case 'button':
	    fieldMarkup = '<div class="weui_btn_area"><a class="weui_btn weui_btn_primary" ' + fieldAttrsString + '>' + fieldLabelText + '</a></div>';
        break;
      case 'submit':
        fieldMarkup = '<div class="weui_btn_area"><button class="weui_btn weui_btn_primary" ' + fieldAttrsString + '>' + fieldLabelVal + '</button></div>';
        break;
      case 'checkbox':
        fieldMarkup = '<div class="weui_cells weui_cells_radio"><label class="weui_cell weui_check_label" for="' + fieldAttrs.id + '"><div class="weui_cell_bd weui_cell_primary"><p>' + fieldLabelText + ' ' + fieldRequired + ' ' + fieldDesc + '</p></div><div class="weui_cell_ft"><input class="weui_check" ' + fieldAttrsString + '><span class="weui_icon_checked"></span></div></label></div>';

        if (fieldAttrs.toggle) {
          setTimeout(function () {
            $(document.getElementById(fieldAttrs.id)).kcToggle();
          }, 100);
        }
        break;
      default:
        fieldMarkup = '<' + fieldAttrs.type + '>' + fieldLabelText + '</' + fieldAttrs.type + '>';
    }

    if (fieldAttrs.type !== 'hidden') {
      var className = fieldAttrs.id ? 'form-group field-' + fieldAttrs.id : '';
      fieldMarkup = _helpers.markup('div', fieldMarkup, {
        className: className
      });
    } else {
      fieldMarkup = _helpers.markup('input', null, fieldAttrs);
    }

    return fieldMarkup;
  };

  /**
   * Convert camelCase into lowercase-hyphen
   *
   * @param  {string} str
   * @return {string}
   */
  _helpers.hyphenCase = function (str) {
    str = str.replace(/[^\w\s\-]/gi, '');
    str = str.replace(/([A-Z])/g, function ($1) {
      return '-' + $1.toLowerCase();
    });

    return str.replace(/\s/g, '-').replace(/^-+/g, '');
  };

  _helpers.attrString = function (attrs) {
    var attributes = [];

    for (var attr in attrs) {
      if (attrs.hasOwnProperty(attr)) {
        attr = _helpers.safeAttr(attr, attrs[attr]);
        attributes.push(attr.name + attr.value);
      }
    }
    return attributes.join(' ');
  };

  _helpers.safeAttr = function (name, value) {
    var safeAttr = {
      className: 'class'
    };

    name = safeAttr[name] || name;
    value = value ? window.JSON.stringify(value) : false;
    value = value ? '=' + value : '';

    return {
      name: name,
      value: value
    };
  };

  _helpers.safeAttrName = function (name) {
    var safeAttr = {
      className: 'class'
    };

    return safeAttr[name] || _helpers.hyphenCase(name);
  };

  _helpers.parseAttrs = function (attrNodes) {
    var fieldAttrs = {};
    for (var attr in attrNodes) {
      if (attrNodes.hasOwnProperty(attr)) {
        fieldAttrs[attrNodes[attr].name] = attrNodes[attr].value;
      }
    }
    return fieldAttrs;
  };

  /**
   * Extend Element prototype to allow us to append fields
   *
   * @param  {object} fields Node elements
   */
  Element.prototype.appendFormFields = function (fields) {
    var element = this;
    fields.reverse();
    for (var i = fields.length - 1; i >= 0; i--) {
      element.appendChild(fields[i]);
    }
  };

  /**
   * Extend Element prototype to remove content
   */
  Element.prototype.emptyContainer = function () {
    var element = this;
    while (element.lastChild) {
      element.removeChild(element.lastChild);
    }
  };

  // Begin the core plugin
  var rendered = [];

  var formData = $.parseXML(opts.formData),
      fields = $('field', formData);
  // @todo - form configuration settings (control position, creatorId, theme etc)
  // settings = $('settings', formData);

  // generate field markup if we have fields
  if (fields.length) {
    fields.each(function (index, field) {
      index = index;
      rendered.push(_helpers.fieldRender(field));
    });
  } else {
    var noData = _helpers.markup('div', opts.label.noFormData, {
      className: 'no-form-data'
    });
    rendered.push(noData);
    opts.notify.error(opts.label.noFormData);
  }

  if (opts.render) {
    if (opts.container) {
      opts.container = opts.container instanceof jQuery ? opts.container[0] : opts.container;
      opts.container.emptyContainer();
      opts.container.appendFormFields(rendered);
    } else if (element) {
      var renderedFormWrap = document.querySelector('.weui_cells .weui_cells_form');
      if (renderedFormWrap) {
        renderedFormWrap.emptyContainer();
        renderedFormWrap.appendFormFields(rendered);
      } else {
        renderedFormWrap = _helpers.markup('div', rendered, { className: 'weui_cells weui_cells_form' });
        element.parentNode.insertBefore(renderedFormWrap, element.nextSibling);
        element.style.display = 'none';
        element.setAttribute('disabled', 'disabled');
      }
    }
    if (fields.length) {
      opts.notify.success(opts.label.formRendered);
    }
  } else {
    formRender.markup = rendered.map(function (elem) {
      return elem.innerHTML;
    }).join('');
  }

  return formRender;
}

(function ($) {

  $.fn.formRender = function (options) {
    this.each(function () {
      var formRender = new FormRenderFn(options, this);
      return formRender;
    });
  };
})(jQuery);