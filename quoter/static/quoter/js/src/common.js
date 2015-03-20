var PrefilledSelector = React.createClass({
    mixins: [PrefilledMixin],
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
        options = this.buildOptions();
        return (
            <select value={this.state.selected} onChange={this.handleChange} ref="selector" className="form-control">;
                {options}
            </select>
        );
    }
});

var PrefilledMultiSelect = React.createClass({
    mixins:[PrefilledMixin],
    getInitialState: function() { 
        return { selected: [] }
    },
    propTypes: {
        options: React.PropTypes.array.isRequired
    },
    getValues: function() {
        return this.state.selected;
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
        options = this.buildOptions();
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

var AjaxSelector = React.createClass({
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

var AddNewButton = React.createClass({
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

