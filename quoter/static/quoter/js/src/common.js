"use strict";
var React = require('react');
var $ = require('jquery');

/* MIXINS */

exports.AjaxPoster = {
    post: function(url, data, callback) {
        var jqxhr = $.post(url, data, function(response) {
            if (response.result == "success") {
                callback(response);
            } else {
                // alert of an error
            }
        }).done(function() { })
          .fail(function() { });
    }
}

exports.AjaxGetter = {
    get: function(url, callback) {
        var jqxhr = $.get(url, function(response) {
            if (response.result == 'success') {
                callback(response.data);
            }
        });
    }
}
exports.PrefilledMixin = {
    propTypes: {
        options: React.PropTypes.array.isRequired,
    },
    buildOptions: function() {
        var options = [];
        for (var i = 0; i < this.props.options.length; i++) {
            var option = this.props.options[i];
            options.push(
                <option key={i} value={option.value}>{option.display}</option>
            );
        }
        return options;
    }
};

exports.Editable = {
    /**
     * Editable enable an edit mode for forms. At the end of the form will be added
     * a combobox with all known data for the type edited by the form.
     * Selecting an item out of the combobox will load the object in the form,
     * so the user can modify the object.
     * Class using Editable must implement a load(object) function, to get the object
     * inforlation. They also should test for the inEditMode state flag, to know if
     * they must Create or Edit an object. 
     *
     * Note: this mixin requires both AjaxGetter and AjaxPoster.
     *
     * **/
    propTypes: {
        modifiables: React.PropTypes.array,
        url_get: React.PropTypes.string.isRequired,
        url_modify: React.PropTypes.string.isRequired
    },
    getInitialState: function() { return { inEditMode: false, currentId: 0} },
    getObjectAndLoad: function(to_modify) {
        this.setState({"inEditMode": true, currentId: to_modify});
        this.get(this.props.url_get + to_modify, this.load);
    },
    clickModify: function(e) {
        e.preventDefault();
        var to_modify = this.refs.to_modify.getValue();
        this.getObjectAndLoad(to_modify);
    },
    sendUpdate: function(new_data, callback) {
        this.setState({inEditMode: false, currentId: 0});
        this.post(this.props.url_modify + this.state.currentId, new_data, callback);
    },
    saveOrModify: function() {
        if (this.state.inEditMode) {
            return "Modify";
        } else {
            return "Save";
        }
    },
    renderEdit: function() {
        return (
                <div className="input-group">
                    <exports.PrefilledSelector ref="to_modify" options={this.props.modifiables}/>
                    <span className="input-group-btn">
                        <button onClick={this.clickModify} className="btn btn-default" type="button">
                            Modify
                        </button>
                    </span>
                </div>
            );
    }
}


/* COMPONENTS */

exports.PrefilledSelector = React.createClass({
    mixins: [exports.PrefilledMixin],
    propTypes: {
        callback: React.PropTypes.func
    },
    empty: function() {
        if (this.props.options.length > 0) {
            this.setState({'selected':this.props.options[0].value});
        }
    },
    getInitialState: function() {
        return {
            selected: 0
        }
    },
    componentWillMount: function() {
        this.buildOptions();
    },
    componentWillReceiveProps: function(newprops) {
        if (this.state.selected == 0 
            && newprops.options 
            && newprops.options.length > 0) {
            this.setState({'selected':newprops.options[0].value});
            this.callParameterChangeIfNeeded(newprops.options[0].value);
        }
    },
    handleChange: function() {
        var new_value = this.refs.selector.getDOMNode().value;
        this.setState({'selected':new_value});
        this.callParameterChangeIfNeeded(new_value);
    },
    callParameterChangeIfNeeded: function(new_value) {
        if (this.props.callback) {
            this.props.callback(new_value);
        }
    },
    getValue: function() {
        return this.refs.selector.getDOMNode().value;
    },
    setValue: function(value) {
        this.setState({'selected': value});
        this.callParameterChangeIfNeeded(value);
    },
    render: function() { 
        var options = this.buildOptions();
        return (
            <select value={this.state.selected} onChange={this.handleChange} ref="selector" className="form-control">;
                {options}
            </select>
        );
    }
});

exports.PrefilledMultiSelect = React.createClass({
    mixins:[exports.PrefilledMixin],
    getInitialState: function() { 
        return { selected: [] }
    },
    propTypes: {
        options: React.PropTypes.array.isRequired
    },
    getValues: function() {
        return this.state.selected;
    },
    setValues: function(data) {
        this.setState({selected: data});
    },
    handleChange: function(e) {
        var options = e.target.options;
        var selection = [];
        for (var i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selection.push(options[i].value);
            }
        }
        this.setState({selected:selection});
    },
    empty: function() {
        this.setState(this.getInitialState());
    },
    render: function() { 
        var options = this.buildOptions();
        return (
        <div className="input-group">
            <select ref='selector' value={this.state.selected} multiple={true} id="quote-add-author" className="form-control" name="author" onChange={this.handleChange}>
                {options}
            </select>
            <span className="input-group-btn">
                <button className="btn btn-default" id="button-new-author" type="button">Add new</button>
            </span>
        </div>
        );
    }
});

exports.AjaxSelector = React.createClass({
    propTypes: {
        url: React.PropTypes.string.isRequired
    },
    getInitialState: function() {
        return {
            options: []
        }
    },
    componentDidMount: function() {
        // get your data
        $.ajax({
            url: this.props.url,
            success: this.successHandler
        })
    },
    successHandler: function(data) {
        // assuming data is an array of {name: "foo", value: "bar"}
        for (var i = 0; i < data.length; i++) {
            var option = data[i];
            this.state.options.push(
                <option key={i} value={option.value}>{option.name}</option>
            );
        }
    },
    render: function() {
        return this.transferPropsTo(
            <select>{this.state.options}</select>
        )
    }
});

exports.AddNewButton = React.createClass({
    propTypes: {
        switcher: React.PropTypes.func.isRequired,
        toPanel: React.PropTypes.number.isRequired
    },
    handleClick: function() {
        this.props.switcher(this.props.toPanel);
    },
    render: function() {
        return (
            <button onClick={this.handleClick} className="btn btn-default" type="button">Add new</button>
        )
    }
});
