import _extends from 'babel-runtime/helpers/extends';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed';

import { submit_parent_form, get_scrollbar_width } from './misc/dom';

// Possible enhancements:
//
//  * If the menu is close to a screen edge,
//    automatically reposition it so that it fits on the screen
//  * Maybe show menu immediately above the toggler
//    (like in Material design), not below it.
//
// https://material.google.com/components/menus.html

var Empty_value_option_value = '';

var value_prop_type = PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]);

var Select = function (_PureComponent) {
	_inherits(Select, _PureComponent);

	function Select(props) {
		_classCallCheck(this, Select);

		// Shouldn't memory leak because
		// the set of options is assumed to be constant.
		var _this = _possibleConstructorReturn(this, (Select.__proto__ || _Object$getPrototypeOf(Select)).call(this, props));

		_initialiseProps.call(_this);

		_this.options = {};

		var _this$props = _this.props,
		    value = _this$props.value,
		    autocomplete = _this$props.autocomplete,
		    options = _this$props.options,
		    children = _this$props.children,
		    menu = _this$props.menu,
		    toggler = _this$props.toggler,
		    onChange = _this$props.onChange;


		if (autocomplete) {
			if (!options) {
				throw new Error('"options" property is required for an "autocomplete" select');
			}

			_this.state.matching_options = _this.get_matching_options(options, value);
		}

		if (children && !menu) {
			React.Children.forEach(children, function (element) {
				if (!element.props.value) {
					throw new Error('You must specify "value" prop on each child of <Select/>');
				}

				if (!element.props.label) {
					throw new Error('You must specify "label" prop on each child of <Select/>');
				}
			});
		}

		if (menu && !toggler) {
			throw new Error('Supply a "toggler" component when enabling "menu" in <Select/>');
		}

		if (!menu && !onChange) {
			throw new Error('"onChange" property must be specified for a non-menu <Select/>');
		}
		return _this;
	}

	// Client side rendering, javascript is enabled


	_createClass(Select, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			var _props = this.props,
			    fallback = _props.fallback,
			    nativeExpanded = _props.nativeExpanded;


			document.addEventListener('click', this.document_clicked);

			if (fallback) {
				this.setState({ javascript: true });
			}

			if (nativeExpanded) {
				this.resize_native_expanded_select();
				window.addEventListener('resize', this.resize_native_expanded_select);
			}
		}
	}, {
		key: 'componentDidUpdate',
		value: function componentDidUpdate(previous_props, previous_state) {
			var _props2 = this.props,
			    nativeExpanded = _props2.nativeExpanded,
			    value = _props2.value;
			var _state = this.state,
			    expanded = _state.expanded,
			    height = _state.height;


			if (expanded !== previous_state.expanded) {
				if (expanded && this.should_animate()) {
					if (height === undefined) {
						this.calculate_height();
					}
				}
			}

			// If the `value` changed then resize the native expanded `<select/>`
			if (nativeExpanded && value !== previous_props.value) {
				this.resize_native_expanded_select();
			}
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			var nativeExpanded = this.props.nativeExpanded;


			document.removeEventListener('click', this.document_clicked);

			if (nativeExpanded) {
				window.removeEventListener('resize', this.resize_native_expanded_select);
			}

			if (this.toggle_timeout) {
				clearTimeout(this.toggle_timeout);
				this.toggle_timeout = undefined;
			}

			if (this.scroll_into_view_timeout) {
				clearTimeout(this.scroll_into_view_timeout);
				this.scroll_into_view_timeout = undefined;
			}

			if (this.restore_focus_on_collapse_timeout) {
				clearTimeout(this.restore_focus_on_collapse_timeout);
				this.restore_focus_on_collapse_timeout = undefined;
			}
		}
	}, {
		key: 'render',
		value: function render() {
			var _this2 = this;

			var _props3 = this.props,
			    id = _props3.id,
			    upward = _props3.upward,
			    scroll = _props3.scroll,
			    children = _props3.children,
			    menu = _props3.menu,
			    toggler = _props3.toggler,
			    alignment = _props3.alignment,
			    autocomplete = _props3.autocomplete,
			    saveOnIcons = _props3.saveOnIcons,
			    fallback = _props3.fallback,
			    native = _props3.native,
			    nativeExpanded = _props3.nativeExpanded,
			    disabled = _props3.disabled,
			    required = _props3.required,
			    placeholder = _props3.placeholder,
			    label = _props3.label,
			    value = _props3.value,
			    error = _props3.error,
			    style = _props3.style,
			    className = _props3.className;
			var _state2 = this.state,
			    expanded = _state2.expanded,
			    list_height = _state2.list_height;


			var options = this.get_options();

			var list_style = void 0;

			// Makes the options list scrollable (only when not in `autocomplete` mode).
			if (this.is_scrollable() && this.state.list_height !== undefined) {
				list_style = { maxHeight: list_height + 'px' };
			}

			var overflow = scroll && options && this.overflown();

			var list_items = void 0;

			// If a list of options is supplied as an array of `{ value, label }`,
			// then transform those elements to <buttons/>
			if (options) {
				list_items = options.map(function (_ref, index) {
					var value = _ref.value,
					    label = _ref.label,
					    icon = _ref.icon;

					return _this2.render_list_item({ index: index, value: value, label: label, icon: !saveOnIcons && icon, overflow: overflow });
				});
			}
			// Else, if a list of options is supplied as a set of child React elements,
			// then render those elements.
			else {
					list_items = React.Children.map(children, function (element, index) {
						if (!element) {
							return;
						}

						return _this2.render_list_item({ index: index, element: element });
					});
				}

			var wrapper_style = { textAlign: alignment };

			var selected = this.get_selected_option();

			var markup = React.createElement(
				'div',
				{
					ref: function ref(_ref3) {
						return _this2.select = _ref3;
					},
					onKeyDown: this.on_key_down_in_container,
					onBlur: this.on_blur,
					style: style ? _extends({}, wrapper_style, style) : wrapper_style,
					className: classNames('rrui__select', {
						'rrui__rich': fallback,
						'rrui__select--upward': upward,
						'rrui__select--expanded': expanded,
						'rrui__select--collapsed': !expanded,
						'rrui__select--disabled': disabled
					}, className) },
				React.createElement(
					'div',
					{
						className: classNames({
							'rrui__input': !toggler
						}) },
					!menu && !native && this.render_selected_item(),
					label && (this.get_selected_option() || placeholder) && React.createElement(
						'label',
						{
							htmlFor: id,
							className: classNames('rrui__input-label', {
								'rrui__input-label--required': required && value_is_empty(value),
								'rrui__input-label--invalid': this.should_indicate_invalid()
							}) },
						label
					),
					menu && this.render_toggler(),
					!native && !nativeExpanded && list_items.length > 0 && React.createElement(
						'ul',
						{
							ref: function ref(_ref2) {
								return _this2.list = _ref2;
							},
							style: list_style,
							className: classNames('rrui__expandable', 'rrui__expandable--overlay', 'rrui__select__options', 'rrui__shadow', {
								'rrui__select__options--menu': menu,
								'rrui__expandable--expanded': expanded,
								'rrui__select__options--expanded': expanded,
								'rrui__expandable--left-aligned': alignment === 'left',
								'rrui__expandable--right-aligned': alignment === 'right',
								'rrui__select__options--left-aligned': !children && alignment === 'left',
								'rrui__select__options--right-aligned': !children && alignment === 'right',
								// CSS selector performance optimization
								'rrui__select__options--upward': upward,
								'rrui__select__options--downward': !upward
							}) },
						list_items
					),
					(native || fallback && !this.state.javascript) && this.render_static()
				),
				this.should_indicate_invalid() && React.createElement(
					'div',
					{ className: 'rrui__input-error' },
					error
				)
			);

			return markup;
		}
	}, {
		key: 'render_list_item',
		value: function render_list_item(_ref4) // , first, last
		{
			var _this3 = this;

			var index = _ref4.index,
			    element = _ref4.element,
			    value = _ref4.value,
			    label = _ref4.label,
			    icon = _ref4.icon,
			    overflow = _ref4.overflow;
			var _props4 = this.props,
			    disabled = _props4.disabled,
			    menu = _props4.menu,
			    scrollbarPadding = _props4.scrollbarPadding;
			var _state3 = this.state,
			    focused_option_value = _state3.focused_option_value,
			    expanded = _state3.expanded;

			// If a list of options is supplied as a set of child React elements,
			// then extract values from their props.

			if (element) {
				value = element.props.value;
			}

			var is_focused = !menu && value === focused_option_value;

			var item_style = void 0;

			// on overflow the vertical scrollbar will take up space
			// reducing padding-right and the only way to fix that
			// is to add additional padding-right
			//
			// a hack to restore padding-right taken up by a vertical scrollbar
			if (overflow && scrollbarPadding) {
				item_style = { marginRight: get_scrollbar_width() + 'px' };
			}

			var button = void 0;

			// If a list of options is supplied as a set of child React elements,
			// then enhance those elements with extra props.
			if (element) {
				var extra_props = {
					style: item_style ? _extends({}, item_style, element.props.style) : element.props.style,
					className: classNames('rrui__select__option', {
						'rrui__select__option--focused': is_focused
					}, element.props.className)
				};

				var onClick = element.props.onClick;

				extra_props.onClick = function (event) {
					if (menu) {
						_this3.toggle();
					} else {
						_this3.item_clicked(value, event);
					}

					if (onClick) {
						onClick(event);
					}
				};

				button = React.cloneElement(element, extra_props);
			}
			// Else, if a list of options is supplied as an array of `{ value, label }`,
			// then transform those options to <buttons/>
			else {
					button = React.createElement(
						'button',
						{
							type: 'button',
							onClick: function onClick(event) {
								return _this3.item_clicked(value, event);
							},
							disabled: disabled,
							tabIndex: '-1',
							className: classNames('rrui__select__option', {
								'rrui__select__option--focused': is_focused,
								// CSS selector performance optimization
								'rrui__select__option--disabled': disabled
							}),
							style: item_style },
						icon && React.cloneElement(icon, { className: classNames(icon.props.className, 'rrui__select__option-icon') }),
						label
					);
				}

			var markup = React.createElement(
				'li',
				{
					key: get_option_key(value),
					ref: function ref(_ref5) {
						return _this3.options[get_option_key(value)] = _ref5;
					},
					className: classNames('rrui__expandable__content', 'rrui__select__options-list-item', {
						'rrui__select__separator-option': element && element.type === Select.Separator,
						'rrui__expandable__content--expanded': expanded,
						// CSS selector performance optimization
						'rrui__select__options-list-item--expanded': expanded
					}) },
				button
			);

			return markup;
		}

		// Renders the selected option
		// and possibly a transparent native `<select/>` above it
		// so that the native `<select/>` expands upon click
		// on the selected option
		// (in case of `nativeExpanded` setting).

	}, {
		key: 'render_selected_item',
		value: function render_selected_item() {
			var _props5 = this.props,
			    nativeExpanded = _props5.nativeExpanded,
			    toggler = _props5.toggler;


			if (toggler) {
				return this.render_toggler();
			}

			var selected = this.render_selected_item_only();

			if (nativeExpanded) {
				return React.createElement(
					'div',
					{ style: native_expanded_select_container_style },
					this.render_static(),
					selected
				);
			}

			return selected;
		}
	}, {
		key: 'render_selected_item_only',
		value: function render_selected_item_only() {
			var _this4 = this;

			var _props6 = this.props,
			    children = _props6.children,
			    value = _props6.value,
			    placeholder = _props6.placeholder,
			    label = _props6.label,
			    disabled = _props6.disabled,
			    autocomplete = _props6.autocomplete,
			    concise = _props6.concise,
			    tabIndex = _props6.tabIndex,
			    onFocus = _props6.onFocus,
			    title = _props6.title,
			    inputClassName = _props6.inputClassName;
			var _state4 = this.state,
			    expanded = _state4.expanded,
			    autocomplete_width = _state4.autocomplete_width,
			    autocomplete_input_value = _state4.autocomplete_input_value;


			var selected = this.get_selected_option();
			var selected_label = this.get_selected_option_label();

			var selected_text = selected ? selected_label : placeholder || label;

			if (autocomplete && expanded) {
				// style = { ...style, width: autocomplete_width + 'px' }

				var _markup = React.createElement('input', {
					type: 'text',
					ref: function ref(_ref6) {
						return _this4.autocomplete = _ref6;
					},
					placeholder: selected_text,
					value: autocomplete_input_value,
					onChange: this.on_autocomplete_input_change,
					onKeyDown: this.on_key_down,
					onFocus: onFocus,
					tabIndex: tabIndex,
					title: title,
					className: classNames('rrui__input-field', 'rrui__select__selected', 'rrui__select__selected--autocomplete', {
						'rrui__select__selected--nothing': !selected_label,
						// CSS selector performance optimization
						'rrui__select__selected--expanded': expanded,
						'rrui__select__selected--disabled': disabled
					}, inputClassName) });

				return _markup;
			}

			var markup = React.createElement(
				'button',
				{
					ref: function ref(_ref7) {
						return _this4.selected = _ref7;
					},
					type: 'button',
					disabled: disabled,
					onClick: this.toggle,
					onKeyDown: this.on_key_down,
					onFocus: onFocus,
					tabIndex: tabIndex,
					title: title,
					className: classNames('rrui__input-field', 'rrui__select__selected', {
						'rrui__input-field--invalid': this.should_indicate_invalid(),
						'rrui__select__selected--nothing': !selected_label
					}) },
				React.createElement(
					'div',
					{ className: 'rrui__select__selected-content' },
					React.createElement(
						'div',
						{ className: 'rrui__select__selected-label' },
						concise && selected && selected.icon ? React.cloneElement(selected.icon, { title: selected_label }) : selected_text
					),
					React.createElement('div', {
						className: classNames('rrui__select__arrow', {
							// CSS selector performance optimization
							'rrui__select__arrow--expanded': expanded
						}) })
				)
			);

			return markup;
		}
	}, {
		key: 'render_toggler',
		value: function render_toggler() {
			var _this5 = this;

			var toggler = this.props.toggler;


			return React.createElement(
				'div',
				{ className: 'rrui__select__toggler' },
				React.cloneElement(toggler, {
					ref: function ref(_ref8) {
						return _this5.selected = _ref8;
					},
					onClick: this.toggle,
					onKeyDown: this.on_key_down
				})
			);
		}

		// supports disabled javascript

	}, {
		key: 'render_static',
		value: function render_static() {
			var _this6 = this;

			var _props7 = this.props,
			    id = _props7.id,
			    name = _props7.name,
			    value = _props7.value,
			    label = _props7.label,
			    disabled = _props7.disabled,
			    options = _props7.options,
			    menu = _props7.menu,
			    toggler = _props7.toggler,
			    fallback = _props7.fallback,
			    nativeExpanded = _props7.nativeExpanded,
			    children = _props7.children;


			if (menu) {
				var _markup2 = React.createElement(
					'div',
					{
						className: classNames({
							'rrui__rich__fallback': fallback
						}) },
					toggler
				);

				return _markup2;
			}

			var markup = React.createElement(
				'select',
				{
					ref: function ref(_ref9) {
						return _this6.native = _ref9;
					},
					id: id,
					name: name,
					value: value_is_empty(value) ? Empty_value_option_value : value,
					disabled: disabled,
					onChange: this.native_select_on_change,
					className: classNames('rrui__input', 'rrui__select__native', {
						'rrui__select__native-expanded': nativeExpanded,
						'rrui__rich__fallback': fallback
					}) },
				options ? this.render_native_select_options(options, value_is_empty(value)) : React.Children.map(children, function (child) {
					if (!child) {
						return;
					}

					var markup = React.createElement(
						'option',
						{
							className: 'rrui__select__native-option',
							key: child.props.value,
							value: child.props.value },
						child.props.label
					);

					return markup;
				})
			);

			return markup;
		}
	}, {
		key: 'render_native_select_options',
		value: function render_native_select_options(options, empty_option_is_selected) {
			var placeholder = this.props.placeholder;


			var empty_option_present = false;

			var rendered_options = options.map(function (option) {
				var value = option.value,
				    label = option.label;


				if (value_is_empty(value)) {
					empty_option_present = true;
					value = Empty_value_option_value;
				}

				var markup = React.createElement(
					'option',
					{
						className: 'rrui__select__native-option',
						key: get_option_key(value),
						value: value },
					label
				);

				return markup;
			});

			if (empty_option_is_selected && !empty_option_present) {
				rendered_options.unshift(React.createElement(
					'option',
					{
						className: 'rrui__select__native-option',
						key: get_option_key(undefined),
						value: '' },
					placeholder
				));
			}

			return rendered_options;
		}

		// Whether should indicate that the input value is invalid

	}, {
		key: 'should_indicate_invalid',
		value: function should_indicate_invalid() {
			var _props8 = this.props,
			    indicateInvalid = _props8.indicateInvalid,
			    error = _props8.error;


			return indicateInvalid && error;
		}
	}, {
		key: 'get_selected_option',
		value: function get_selected_option() {
			var value = this.props.value;


			return this.get_option(value);
		}
	}, {
		key: 'get_option',
		value: function get_option(value) {
			var _props9 = this.props,
			    options = _props9.options,
			    children = _props9.children;


			if (options) {
				return options.filter(function (x) {
					return x.value === value;
				})[0];
			}

			var option = void 0;

			React.Children.forEach(children, function (child) {
				if (child.props.value === value) {
					option = child;
				}
			});

			return option;
		}
	}, {
		key: 'get_option_index',
		value: function get_option_index(option) {
			var _props10 = this.props,
			    options = _props10.options,
			    children = _props10.children;


			if (options) {
				return options.indexOf(option);
			}

			var option_index = void 0;

			React.Children.forEach(children, function (child, index) {
				if (child.props.value === option.value) {
					option_index = index;
				}
			});

			return option_index;
		}
	}, {
		key: 'get_selected_option_label',
		value: function get_selected_option_label() {
			var options = this.props.options;


			var selected = this.get_selected_option();

			if (!selected) {
				return;
			}

			if (options) {
				return selected.label;
			}

			return selected.props.label;
		}
	}, {
		key: 'overflown',
		value: function overflown() {
			var _props11 = this.props,
			    options = _props11.options,
			    maxItems = _props11.maxItems;


			return options.length > maxItems;
		}
	}, {
		key: 'scrollable_list_height',
		value: function scrollable_list_height() {
			var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.state;
			var maxItems = this.props.maxItems;

			// (Adding vertical padding so that it shows these `maxItems` options fully)

			return (state.height - 2 * state.vertical_padding) * (maxItems / this.get_options().length) + state.vertical_padding;
		}
	}, {
		key: 'should_animate',
		value: function should_animate() {
			return true;

			// return this.props.options.length >= this.props.transition_item_count_min
		}
	}, {
		key: 'focus',
		value: function focus() {
			if (this.autocomplete) {
				this.autocomplete.focus();
			} else {
				this.selected.focus();
			}
		}

		// Would have used `onBlur={...}` event handler here
		// with `if (container.contains(event.relatedTarget))` condition,
		// but it doesn't work in IE in React.
		// https://github.com/facebook/react/issues/3751
		//
		// Therefore, using the hacky `document.onClick` handlers
		// and this `onKeyDown` Tab handler
		// until `event.relatedTarget` support is consistent in React.
		//


		// This handler is a workaround for `redux-form`

	}, {
		key: 'get_options',
		value: function get_options() {
			var _props12 = this.props,
			    autocomplete = _props12.autocomplete,
			    autocompleteShowAll = _props12.autocompleteShowAll,
			    maxItems = _props12.maxItems,
			    options = _props12.options;
			var matching_options = this.state.matching_options;


			if (!autocomplete) {
				return options;
			}

			if (autocompleteShowAll) {
				return matching_options;
			}

			return matching_options.slice(0, maxItems);
		}

		// Get the previous option (relative to the currently focused option)

	}, {
		key: 'previous_focusable_option',
		value: function previous_focusable_option() {
			var options = this.get_options();
			var focused_option_value = this.state.focused_option_value;


			var i = 0;
			while (i < options.length) {
				if (options[i].value === focused_option_value) {
					if (i - 1 >= 0) {
						return options[i - 1];
					}
				}
				i++;
			}
		}

		// Get the next option (relative to the currently focused option)

	}, {
		key: 'next_focusable_option',
		value: function next_focusable_option() {
			var options = this.get_options();
			var focused_option_value = this.state.focused_option_value;


			var i = 0;
			while (i < options.length) {
				if (options[i].value === focused_option_value) {
					if (i + 1 < options.length) {
						return options[i + 1];
					}
				}
				i++;
			}
		}

		// Scrolls to an option having the value

	}, {
		key: 'scroll_to',
		value: function scroll_to(value) {
			var vertical_padding = this.state.vertical_padding;


			var option_element = ReactDOM.findDOMNode(this.options[get_option_key(value)]);
			var list = ReactDOM.findDOMNode(this.list);

			// If this option isn't even shown
			// (e.g. autocomplete)
			// then don't scroll to it because there's nothing to scroll to.
			if (!option_element) {
				return;
			}

			var offset_top = option_element.offsetTop;

			var is_first_option = list.firstChild === option_element;

			// If it's the first one - then scroll to list top
			if (is_first_option) {
				offset_top -= vertical_padding;
			}

			list.scrollTop = offset_top;
		}

		// Fully shows an option having the `value` (scrolls to it if neccessary)

	}, {
		key: 'show_option',
		value: function show_option(value, gravity) {
			var vertical_padding = this.state.vertical_padding;


			var option_element = ReactDOM.findDOMNode(this.options[get_option_key(value)]);
			var list = ReactDOM.findDOMNode(this.list);

			var is_first_option = list.firstChild === option_element;
			var is_last_option = list.lastChild === option_element;

			switch (gravity) {
				case 'top':
					var top_line = option_element.offsetTop;

					if (is_first_option) {
						top_line -= vertical_padding;
					}

					if (top_line < list.scrollTop) {
						list.scrollTop = top_line;
					}

					return;

				case 'bottom':
					var bottom_line = option_element.offsetTop + option_element.offsetHeight;

					if (is_last_option) {
						bottom_line += vertical_padding;
					}

					if (bottom_line > list.scrollTop + list.offsetHeight) {
						list.scrollTop = bottom_line - list.offsetHeight;
					}

					return;
			}
		}

		// Calculates height of the expanded item list

	}, {
		key: 'calculate_height',
		value: function calculate_height() {
			var options = this.props.options;


			var list_dom_node = ReactDOM.findDOMNode(this.list);
			var border = parseInt(window.getComputedStyle(list_dom_node).borderTopWidth);
			var height = list_dom_node.scrollHeight;

			var vertical_padding = parseInt(window.getComputedStyle(list_dom_node).paddingTop);

			// For things like "accordeon".
			//
			// const images = list_dom_node.querySelectorAll('img')
			//
			// if (images.length > 0)
			// {
			// 	return this.preload_images(list_dom_node, images)
			// }

			var state = { height: height, vertical_padding: vertical_padding, border: border };

			if (this.is_scrollable() && options && this.overflown()) {
				state.list_height = this.scrollable_list_height(state);
			}

			this.setState(state);
		}
	}, {
		key: 'is_scrollable',
		value: function is_scrollable() {
			var _props13 = this.props,
			    menu = _props13.menu,
			    autocomplete = _props13.autocomplete,
			    autocompleteShowAll = _props13.autocompleteShowAll,
			    scroll = _props13.scroll;


			return !menu && (autocomplete && autocompleteShowAll || !autocomplete) && scroll;
		}

		// This turned out not to work for `autocomplete`
		// because not all options are ever shown.
		// get_widest_label_width()
		// {
		// 	// <ul/> -> <li/> -> <button/>
		// 	const label = ReactDOM.findDOMNode(this.list).firstChild.firstChild
		//
		// 	const style = getComputedStyle(label)
		//
		// 	const width = parseFloat(style.width)
		// 	const side_padding = parseFloat(style.paddingLeft)
		//
		// 	return width - 2 * side_padding
		// }

	}, {
		key: 'get_matching_options',


		// // https://github.com/daviferreira/react-sanfona/blob/master/src/AccordionItem/index.jsx#L54
		// // Wait for images to load before calculating maxHeight
		// preload_images(node, images)
		// {
		// 	let images_loaded = 0
		//
		// 	const image_loaded = () =>
		// 	{
		// 		images_loaded++
		//
		// 		if (images_loaded === images.length)
		// 		{
		// 			this.setState
		// 			({
		// 				height: this.props.expanded ? node.scrollHeight : 0
		// 			})
		// 		}
		// 	}
		//
		// 	for (let i = 0; i < images.length; i += 1)
		// 	{
		// 		const image = new Image()
		// 		image.src = images[i].src
		// 		image.onload = image.onerror = image_loaded
		// 	}
		// }
		value: function get_matching_options(options, value) {
			// If the autocomplete value is `undefined` or empty
			if (!value) {
				return options;
			}

			value = value.toLowerCase();

			return options.filter(function (_ref10) {
				var label = _ref10.label,
				    verbose = _ref10.verbose;

				return (verbose || label).toLowerCase().indexOf(value) >= 0;
			});
		}
	}]);

	return Select;
}(PureComponent);

Select.propTypes = {
	// A list of selectable options
	options: PropTypes.arrayOf(PropTypes.shape({
		// Option value (may be `undefined`)
		value: value_prop_type,
		// Option label (may be `undefined`)
		label: PropTypes.string,
		// Option icon
		icon: PropTypes.node
	})),

	// HTML form input `name` attribute
	name: PropTypes.string,

	// Label which is placed above the select
	label: PropTypes.string,

	// Placeholder (like "Choose")
	placeholder: PropTypes.string,

	// Whether to use native `<select/>`
	native: PropTypes.bool.isRequired,

	// Whether to use native `<select/>` when expanded
	nativeExpanded: PropTypes.bool.isRequired,

	// Show icon only for selected item,
	// and only if `concise` is `true`.
	saveOnIcons: PropTypes.bool,

	// Disables this control
	disabled: PropTypes.bool,

	// Set to `true` to mark the field as required
	required: PropTypes.bool.isRequired,

	// Selected option value
	value: value_prop_type,

	// Is called when an option is selected
	onChange: PropTypes.func,

	// Is called when the select is focused
	onFocus: PropTypes.func,

	// Is called when the select is blurred.
	// This `onBlur` interceptor is a workaround for `redux-form`,
	// so that it gets the parsed `value` in its `onBlur` handler,
	// not the formatted text.
	onBlur: PropTypes.func,

	// (exotic use case)
	// Falls back to a plain HTML input
	// when javascript is disabled (e.g. Tor)
	fallback: PropTypes.bool.isRequired,

	// Component CSS class
	className: PropTypes.string,

	// Autocomplete `<input/>` CSS class
	inputClassName: PropTypes.string,

	// CSS style object
	style: PropTypes.object,

	// If this flag is set to `true`,
	// and `icon` is specified for a selected option,
	// then the selected option will be displayed
	// as icon only, without the label.
	concise: PropTypes.bool,

	// HTML `tabindex` attribute
	tabIndex: PropTypes.number,

	// If set to `true`, autocompletion is available
	// upon expanding the options list.
	autocomplete: PropTypes.bool,

	// If set to `true`, autocomple will show all
	// matching options instead of just `maxItems`.
	autocompleteShowAll: PropTypes.bool,

	// Options list alignment ("left", "right")
	alignment: PropTypes.oneOf(['left', 'right']),

	// If `menu` flag is set to `true`
	// then it's gonna be a dropdown menu
	// with `children` elements inside
	// and therefore `onChange` won't be called
	// on menu item click.
	menu: PropTypes.bool,

	// If `menu` flag is set to `true`
	// then `toggler` is the dropdown menu button.
	toggler: PropTypes.element,

	// If `scroll` is `false`, then options list
	// is not limited in height.
	// Is `true` by default (scrollable).
	scroll: PropTypes.bool.isRequired,

	// If this flag is set to `true`,
	// then the dropdown expands itself upward.
	// (as opposed to the default downward)
	upward: PropTypes.bool,

	// Maximum items fitting the options list height (scrollable).
	// In case of `autocomplete` that's the maximum number of matched items shown.
	// Is `6` by default.
	maxItems: PropTypes.number.isRequired,

	// Is `true` by default (only when the list of options is scrollable)
	scrollbarPadding: PropTypes.bool,

	focusUponSelection: PropTypes.bool.isRequired,

	// When the `<Select/>` is expanded
	// the options list may not fit on the screen.
	// If `scrollIntoView` is `true` (which is the default)
	// then the browser will automatically scroll
	// so that the expanded options list fits on the screen.
	scrollIntoView: PropTypes.bool.isRequired,

	// If `scrollIntoView` is `true` (which is the default)
	// then this is gonna be the delay after which it scrolls into view.
	expandAnimationDuration: PropTypes.number.isRequired,

	onTabOut: PropTypes.func,

	onToggle: PropTypes.func

	// transition_item_count_min : PropTypes.number,
	// transition_duration_min : PropTypes.number,
	// transition_duration_max : PropTypes.number
};
Select.defaultProps = {
	alignment: 'left',
	scroll: true,
	maxItems: 6,
	scrollbarPadding: true,
	focusUponSelection: true,
	fallback: false,
	native: false,
	nativeExpanded: false,
	scrollIntoView: true,
	expandAnimationDuration: 150,

	// Set to `true` to mark the field as required
	required: false

	// transition_item_count_min : 1,
	// transition_duration_min : 60, // milliseconds
	// transition_duration_max : 100 // milliseconds
};

var _initialiseProps = function _initialiseProps() {
	var _this7 = this;

	this.state = {
		// Is initialized during the first `componentDidUpdate()` call
		vertical_padding: 0
	};

	this.native_select_on_change = function (event) {
		var onChange = _this7.props.onChange;


		var value = event.target.value;

		// Convert back from an empty string to `undefined`
		if (value === Empty_value_option_value) {
			// `null` is not accounted for, use `undefined` instead.
			value = undefined;
		}

		onChange(value);
	};

	this.resize_native_expanded_select = function () {
		// For some strange reason 1px on the right side of the `<select/>`
		// still falls through to the underlying selected option label.
		ReactDOM.findDOMNode(_this7.native).style.width = ReactDOM.findDOMNode(_this7.selected).offsetWidth + 1 + 'px';
	};

	this.toggle = function (event) {
		var toggle_options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		if (event) {
			// Don't navigate away when clicking links
			event.preventDefault();

			// Not discarding the click event because
			// other expanded selects may be listening to it.
			// // Discard the click event so that it won't reach `document` click listener
			// event.stopPropagation() // doesn't work
			// event.nativeEvent.stopImmediatePropagation()
		}

		var _props14 = _this7.props,
		    toggler = _props14.toggler,
		    disabled = _props14.disabled,
		    autocomplete = _props14.autocomplete,
		    options = _props14.options,
		    value = _props14.value,
		    focusUponSelection = _props14.focusUponSelection,
		    onToggle = _props14.onToggle,
		    nativeExpanded = _props14.nativeExpanded,
		    scrollIntoView = _props14.scrollIntoView,
		    expandAnimationDuration = _props14.expandAnimationDuration;


		if (nativeExpanded) {
			return;
		}

		if (disabled) {
			return;
		}

		if (_this7.toggle_timeout) {
			clearTimeout(_this7.toggle_timeout);
			_this7.toggle_timeout = undefined;
		}

		if (_this7.scroll_into_view_timeout) {
			clearTimeout(_this7.scroll_into_view_timeout);
			_this7.scroll_into_view_timeout = undefined;
		}

		var expanded = _this7.state.expanded;


		if (!expanded && autocomplete) {
			_this7.setState({
				// The input value can't be `undefined`
				// because in that case React would complain
				// about it being an "uncontrolled input"
				autocomplete_input_value: '',
				matching_options: options
			});

			// if (!this.state.autocomplete_width)
			// {
			// 	this.setState({ autocomplete_width: this.get_widest_label_width() })
			// }
		}

		// Deferring expanding the select upon click
		// because `document.onClick(event)` should fire first,
		// otherwise `event.target` in that handler will be detached
		// from the document and so `this.document_clicked()` handler will
		// immediately toggle the select back to collapsed state.
		_this7.toggle_timeout = setTimeout(function () {
			_this7.toggle_timeout = undefined;

			_this7.setState({
				expanded: !expanded
			}, function () {
				var is_now_expanded = _this7.state.expanded;

				if (!toggle_options.dont_focus_after_toggle) {
					// If it's autocomplete, then focus <input/> field
					// upon toggling the select component.
					if (autocomplete) {
						if (is_now_expanded) {
							// Focus the input after the select is expanded
							_this7.autocomplete.focus();
						} else if (focusUponSelection) {
							// Focus the toggler after the select is collapsed
							_this7.selected.focus();
						}
					} else {
						// For some reason Firefox loses focus
						// upon select expansion via a click,
						// so this extra `.focus()` works around that issue.
						_this7.selected.focus();
					}
				}

				_this7.scroll_into_view_timeout = setTimeout(function () {
					_this7.scroll_into_view_timeout = undefined;

					var is_still_expanded = _this7.state.expanded;

					if (is_still_expanded && _this7.list && scrollIntoView) {
						var element = ReactDOM.findDOMNode(_this7.list);

						// https://developer.mozilla.org/ru/docs/Web/API/Element/scrollIntoViewIfNeeded
						if (element.scrollIntoViewIfNeeded) {
							element.scrollIntoViewIfNeeded(false);
						} else {
							// https://github.com/stipsan/scroll-into-view-if-needed
							scrollIntoViewIfNeeded(element, false, { duration: 800 });
						}
					}
				}, expandAnimationDuration * 1.1);
			});

			if (!expanded && options) {
				// Focus either the selected option
				// or the first option in the list.

				var focused_option_value = value || options[0].value;

				_this7.setState({ focused_option_value: focused_option_value });

				// Scroll down to the focused option
				_this7.scroll_to(focused_option_value);
			}

			if (onToggle) {
				onToggle(!expanded);
			}

			if (toggle_options.callback) {
				toggle_options.callback();
			}
		}, 0);
	};

	this.item_clicked = function (value, event) {
		if (event) {
			event.preventDefault();
		}

		var onChange = _this7.props.onChange;


		_this7.toggle(undefined, { callback: function callback() {
				return onChange(value);
			} });
	};

	this.document_clicked = function (event) {
		var autocomplete = ReactDOM.findDOMNode(_this7.autocomplete);
		var selected_option = ReactDOM.findDOMNode(_this7.selected);
		var options_list = ReactDOM.findDOMNode(_this7.list);

		// Don't close the select if its expander button has been clicked,
		// or if autocomplete has been clicked,
		// or if an option was selected from the list.
		if (options_list && options_list.contains(event.target) || autocomplete && autocomplete.contains(event.target) || selected_option && selected_option.contains(event.target)) {
			return;
		}

		_this7.setState({ expanded: false });

		var onToggle = _this7.props.onToggle;


		if (onToggle) {
			onToggle(false);
		}
	};

	this.on_key_down_in_container = function (event) {
		if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
			return;
		}

		var expanded = _this7.state.expanded;


		switch (event.keyCode) {
			// Toggle on Tab out
			case 9:
				if (expanded) {
					_this7.toggle(undefined, { dont_focus_after_toggle: true });

					var onTabOut = _this7.props.onTabOut;


					if (onTabOut) {
						onTabOut(event);
					}
				}
				return;
		}
	};

	this.on_key_down = function (event) {
		if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
			return;
		}

		var _props15 = _this7.props,
		    options = _props15.options,
		    value = _props15.value,
		    autocomplete = _props15.autocomplete;
		var _state5 = _this7.state,
		    expanded = _state5.expanded,
		    focused_option_value = _state5.focused_option_value;

		// Maybe add support for `children` arrow navigation in future

		if (options) {
			switch (event.keyCode) {
				// Select the previous option (if present) on up arrow
				case 38:
					event.preventDefault();

					var previous = _this7.previous_focusable_option();

					if (previous) {
						_this7.show_option(previous.value, 'top');
						return _this7.setState({ focused_option_value: previous.value });
					}

					return;

				// Select the next option (if present) on down arrow
				case 40:
					event.preventDefault();

					var next = _this7.next_focusable_option();

					if (next) {
						_this7.show_option(next.value, 'bottom');
						return _this7.setState({ focused_option_value: next.value });
					}

					return;

				// Collapse on Escape
				//
				// Maybe add this kind of support for "Escape" key in some future:
				//  hiding the item list, cancelling current item selection process
				//  and restoring the selection present before the item list was toggled.
				//
				case 27:
					// Collapse the list if it's expanded
					if (_this7.state.expanded) {
						_this7.toggle();

						// Restore focus when the list is collapsed
						_this7.restore_focus_on_collapse_timeout = setTimeout(function () {
							_this7.restore_focus_on_collapse_timeout = undefined;

							_this7.selected.focus();
						}, 0);
					}

					return;

				// on Enter
				case 13:
					// Choose the focused item on Enter
					if (expanded) {
						event.preventDefault();

						// If an item is focused
						// (which may not be a case
						//  when autocomplete is matching no items)
						// (still for non-autocomplete select
						//  it is valid to have a default option)
						if (_this7.get_options() && _this7.get_options().length > 0) {
							// Choose the focused item
							_this7.item_clicked(focused_option_value);
						}
					}
					// Else it should have just submitted the form on Enter,
					// but it wouldn't because the select element activator is a <button/>
					// therefore hitting Enter while being focused on it just pushes that button.
					// So submit the enclosing form manually.
					else {
							if (submit_parent_form(ReactDOM.findDOMNode(_this7.select))) {
								event.preventDefault();
							}
						}

					return;

				// on Spacebar
				case 32:
					// Choose the focused item on Enter
					if (expanded) {
						// only if it it's an `options` select
						// and also if it's not an autocomplete
						if (_this7.get_options() && !autocomplete) {
							event.preventDefault();

							// `focused_option_value` could be non-existent
							// in case of `autocomplete`, but since
							// we're explicitly not handling autocomplete here
							// it is valid to select any options including the default ones.
							_this7.item_clicked(focused_option_value);
						}
					}
					// Otherwise, the spacebar keydown event on a `<button/>`
					// will trigger `onClick` and `.toggle()` will be called.

					return;
			}
		}
	};

	this.on_blur = function (event) {
		var _props16 = _this7.props,
		    onBlur = _props16.onBlur,
		    value = _props16.value;

		// If clicked on a select option then don't trigger "blur" event

		if (event.relatedTarget && event.currentTarget.contains(event.relatedTarget)) {
			return;
		}

		// This `onBlur` interceptor is a workaround for `redux-form`,
		// so that it gets the right (parsed, not the formatted one)
		// `event.target.value` in its `onBlur` handler.
		if (onBlur) {
			var _event = _extends({}, event, {
				target: _extends({}, event.target, {
					value: value
				})

				// For `redux-form` event detection.
				// https://github.com/erikras/redux-form/blob/v5/src/events/isEvent.js
			});_event.stopPropagation = event.stopPropagation;
			_event.preventDefault = event.preventDefault;

			onBlur(_event);
		}
	};

	this.on_autocomplete_input_change = function (event) {
		var options = _this7.props.options;

		var input = event.target.value;
		var matching_options = _this7.get_matching_options(options, input);

		_this7.setState({
			autocomplete_input_value: input,
			matching_options: matching_options,
			focused_option_value: matching_options.length > 0 ? matching_options[0].value : undefined
		});
	};
};

export default Select;


Select.Separator = function (props) {
	return React.createElement('div', { className: 'rrui__select__separator' });
};

var native_expanded_select_container_style = {
	display: 'inline-block'

	// There can be an `undefined` value,
	// so just `{ value }` won't do here.
};function get_option_key(value) {
	return value_is_empty(value) ? '@@rrui/select/undefined' : value;
}

function value_is_empty(value) {
	return value === null || value === undefined;
}
//# sourceMappingURL=select.js.map