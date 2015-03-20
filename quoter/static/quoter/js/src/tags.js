var SingleTag = React.createClass({
    propTypes: {
        name: React.PropTypes.string.isRequired,
        isNew: React.PropTypes.bool.isRequired,
        removeFunc: React.PropTypes.func.isRequired
    },
    remove: function(e) {
        e.preventDefault();
        this.props.removeFunc(this.props.name);
    },
    render: function() { 
        var label_class = "label label-default";
        if (!this.tag_id) {
            label_class= "label label-warning";
        }
        return (
            <span className={label_class}>
                {this.props.name}
                <a href="#" className="tag-remover" onClick={this.remove}>X</a>
            </span>
        )
    }
});

var TagSelector = React.createClass({
    propTypes: {
        tags: React.PropTypes.array.isRequired
    },
    getInitialState: function() { 
        return { tagInput : '',
                 currentTagInput : {display:'', value:''},
                 selectedTags: [] };
    },
    empty: function() {
        this.setState(this.getInitialState());
    },
    appendTag: function(display, value) {
        var newTags = this.state.selectedTags.concat({display:display, value:value});
        this.setState({selectedTags : newTags});
    },
    removeTag: function(tag_display) {
        var tags = removeFromIfExist(this.state.selectedTag, function(x) { x.display == tag_display });
        this.setState({selectedTags : tags});
    },
    onKeyDown: function(e) {
        if (e.key === 'ArrowDown') {
            this.refs.autocompleter.down();
        } 
        if (e.key == 'ArrowUp') {
            this.refs.autocompleter.up();
        }
        var selected = this.refs.autocompleter.getSelected()
        var autocomplete_has_selected = selected || false
        if (e.key === 'Enter' || (e.key === 'Tab' && autocomplete_has_selected)) {
            e.preventDefault();
            if (selected) {
                this.setState({'currentTagInput':{display:selected.display, value:selected.value}});
                this.appendTag(selected.display, selected.value);
            } else {
                var currentValue = this.refs.tag.getDOMNode().value;
                var currentTagDisplay = this.state.currentTagInput.display;
                var value = this.state.currentTagInput.value;
                if (currentValue != currentTagDisplay) {
                    value = '';
                } 
                this.appendTag(currentValue, value);
            }
            this.clean();
        } 
    },
    clean: function() {
        /** Empty state information about input, make sure the input
        is set back to nothing.**/
        this.refs.tag.getDOMNode().value = '';
        this.setState({tagInput: '', currentTagInput: ''});
    },
    autocomplete: function() {
        this.setState({tagInput: this.refs.tag.getDOMNode().value});
    },
    getValues: function() {
        result = [];
        for (var i = 0; i < this.state.selectedTags.length; i++) {
            var value_or_new = this.state.selectedTags[i].value || 'new';
            result.push({'display': this.state.selectedTags[i].display, 'value':value_or_new});
        }
        return result;
    },
    listTags: function() {
        var toReturn = [];
        for (var i = 0; i < this.state.selectedTags.length; i++) {
            if (this.state.selectedTags[i].value) {
                toReturn.push(
                    <SingleTag removeFunc={this.removeTag} name={this.state.selectedTags[i].display} isNew={false}/>
                );
            } else {
                toReturn.push(
                    <SingleTag removeFunc={this.removeTag} name={this.state.selectedTags[i].display} isNew={false}/>
                );
            }
        }
        return toReturn;
    },
    render: function() { 
        tags = this.listTags();
        return (
        <div>
            <div className="form-group">
                <label htmlFor="page">Tag</label>
                <input ref="tag" id="quote-tag-autocomplete" onKeyPress={this.onKeyPress} 
                 onKeyUp={this.onKeyUp} onKeyDown={this.onKeyDown} onChange={this.autocomplete} 
                 type="text" name="quote-tag" className="form-control typeahead"/>
                 <Autocompleter ref="autocompleter" choice={this.props.tags} current={this.state.tagInput}/>
            </div>
            <div>
                {tags}
            </div>       
        </div>
        );
    }
});

var Autocompleter = React.createClass({
    propTypes: {
        choice: React.PropTypes.array.isRequired,   // Potential tags
        current: React.PropTypes.string.isRequired  // Current input to match
    },
    getInitialState: function() {
        return {selectedIdx: -1,   // Currently autocomplete select (pseudo combobox)
                selectable: [] // Tags matching
        };
    },
    autocomplete: function(current) {
        if (current.length >= 2) {
            var regexp = new RegExp(current.toLowerCase());
            var allDisplay = this.props.choice.filter(function(x) { return regexp.test(x.display.toLowerCase()); });
            selectedIdx = -1;
            if (allDisplay.length > 0) {
                selectedIdx = 1;
            }
            this.setState({selectable : allDisplay, selectedIdx:selectedIdx});
        } else {
            this.setState({selectable: [], selectedIdx:-1});
        }
    },
    getSelected: function() {
        if (this.state.selectedIdx != -1) {
            return this.state.selectable[this.state.selectedIdx];
        }
    },
    down: function() {
        selectedIdx = this.state.selectedIdx;
        if (this.state.selectable.length) {
            selectedIdx++;
            this.correctSelected(selectedIdx);
        }
        else {
            this.setState({selectedIdx: -1});
        }
    },
    up: function() {
        selectedIdx = this.state.selectedIdx;
        if (this.state.selectable.length) {
            selectedIdx--;
            this.correctSelected(selectedIdx);
        } else {
            this.setState({selectedIdx: -1});
        }
    },
    correctSelected: function(selectedIdx) {
        if (selectedIdx < 0) {
            selectedIdx = this.state.selectable.length -1;
        } else if (selectedIdx > this.state.selectable.length - 1) {
            selectedIdx = 0;
        }
        this.setState({selectedIdx:selectedIdx});
    },
    componentWillReceiveProps: function(nextProps) {
        this.autocomplete(nextProps.current);
    },
    render: function() {
        var choices = this.props.choice;
        if (choices.length > 0) {
            var options = this.buildAutocompleteList(choices);
            return (
                <ul className="list-unstyled">
                    {options}
                </ul>
            )
        } else {
            return (<ul></ul>);
        }
    },
    empty: function() {
        this.setState(getInitialState());
    },
    buildAutocompleteList: function(choices) {
        var options = [];
        var selectedIdx = this.state.selectedIdx;
        for (var i = 0; i < this.state.selectable.length;i++) {
            if (selectedIdx == i) {
                options.push(<li className = "label-default" value={this.state.selectable[i].key}>{this.state.selectable[i].display}</li>)
            } else {
                options.push(<li value={this.state.selectable[i].key}>{this.state.selectable[i].display}</li>)
            }
        }
        return options;
    }
});
