buildQuoter = function(folders_array, tags_array) {
    React.render(<QuoterMenu folders={folders_array} tags={tags_array}/>, document.getElementById('quoterForms'));
    React.render(<QuoterAccess/>, document.getElementById('main-menu-container'));
}

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

var QuoterMenu = React.createClass({
    propTypes: {
        folders: React.PropTypes.array.isRequired,
        tags: React.PropTypes.array.isRequired,
    },
    getInitialState: function() {
        return {
            authors: [],
            tags: [],
            sources : []
        }
    },
    componentWillMount: function() {
        $.get('/source/all', function(data) {
            this.setState({sources: data.data});
        }.bind(this));
        $.get('/author/all', function(data) {
            this.setState({authors: data.data});
        }.bind(this));
        this.state.tags = this.props.tags.slice();
    },
    addAuthor: function(author) {
        var authors = this.state.authors;
        authors = authors.concat(author);
        this.setState({authors: authors});
    },
    addTag: function(tag) {
        var tags = this.state.tags;
        tags = tags.concat(tag)
        this.setState({tags:tags});
    },
    addSource: function(source) {
        var sources = this.state.sources;
        sources = sources.concat(source);
        this.setState({sources: sources});
    },
    render: function() { 
        return (
        <div className="tab-content">
            <FolderForm folders={this.props.folders}/>
            <FindForm tags = {this.state.tags} sources={this.state.sources} authors={this.state.authors} />
            <QuoteForm authors={this.state.authors} sources={this.state.sources} tags={this.state.tags} addTag={this.addTag}/>
            <SourceForm authors={this.state.authors} sources={this.state.sources} addSource={this.addSource}/>
            <AuthorForm authors={this.state.authors} addAuthor={this.addAuthor}/>
        </div>
    );
    }
});

var PrefilledMixin = {
    propTypes: {
        options: React.PropTypes.array.isRequired,
    },
    buildOptions: function() {
        options = [];
        for (var i = 0; i < this.props.options.length; i++) {
            var option = this.props.options[i];
            options.push(
                <option key={i} value={option.value}>{option.display}</option>
            );
        }
        return options;
    }
};

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
    render: function() { 
        options = this.buildOptions();
        return (
            <select value={this.state.selected} onChange={this.handleChange} ref="selector" className="form-control">;
                {options}
            </select>
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


var QuoterAccess = React.createClass({
    getInitialState: function() { return {activeTab: 0}},
    switchTab: function(idx) { this.setState({activeTab: idx}); },
    paneModels: [
        {tabName: "Choose folder", url:'#quote-folder'},
        {tabName: "Find a quote", url:'#quote-find'},
        {tabName: "Add a quote", url:'#quote-add'},
        {tabName: "Add a source", url:'#source-add'},
        {tabName: "Add an author", url:'#author-add'}],
    render: function() { 
        $('.tab-pane.active').removeClass('active');
        $($('.tab-pane').get(this.state.activeTab)).addClass('active');
        return (
        <TabbedArea
            paneModels={this.paneModels}
            activeTab={this.state.activeTab}
            switchTab={this.switchTab}/>
    );
    }
});

var TabbedArea = React.createClass({
    propTypes: { paneModels: React.PropTypes.array.isRequired,
                  activeTab: React.PropTypes.number.isRequired,
                  switchTab: React.PropTypes.func.isRequired
    },
    handleClick: function(idx, e) {
        e.preventDefault();
        this.props.switchTab(idx);
    },
    render: function() {
        return this.transferPropsTo(
                <ul className="nav nav-tabs nav-pills nav-stacked">
                    {this.renderTabs()}
                </ul>);
    },
    renderTabs: function() {
        return this.props.paneModels.map(function(tabName, idx) {
            return (
                <Tab key={idx} onClick={this.handleClick.bind(this, idx)}
                               isActive={idx === this.props.activeTab}
                               name={tabName.tabName}
                               url={tabName.url}
                />);
        }.bind(this));
    }
});

var Tab = React.createClass({
    propTypes: {
        isActive: React.PropTypes.bool.isRequired,
        onClick: React.PropTypes.func.isRequired
    },
    render: function() {
        var className = React.addons.classSet({active: this.props.isActive})
        return (
            <li className={className} onClick={this.props.onClick}>
                <a href={this.props.url}>{this.props.name}</a>
            </li>);
    }
});

var QuoterNav = React.createClass({
    render: function() { return (
        <div className="col-md-2" id="main-menu-container">
            <ul id="main-menu" className="nav nav-tabs nav-pills nav-stacked">
                <li className="active"><a href="#quote-folder">Choose folder</a></li>
                <li><a href="#quote-find">Find a quote</a></li>
                <li><a href="#quote-add">Add a quote</a></li>
                <li><a href="#source-add">Add a source</a></li>
                <li><a href="#author-add">Add an author</a></li>
                <li><a href="#">Export quoter</a></li>
                <li><a href="#">Stats</a></li>
            </ul>
        </div>
    );
    }
});

var AjaxPoster = {
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
var AjaxGetter = {
    get: function(url, callback) {
        var jqxhr = $.get(url, function(response) {
            if (response.result == 'success') {
                callback(response.data);
            }
        });
    }
}

var AddFolderForm = React.createClass({
    mixins: [AjaxPoster],
    render: function() { return (
        <form method="POST" action="/folder/add" role="form" onSubmit={this.handleSubmit}>
            <DjangoCSRF/>
            <div className="form-group">
                <label htmlFor="folder-name">New folder name</label>
                <div className="input-group">
                    <input ref="new_folder_name" type="text" name="new-folder-name" className="form-control"/>
                    <span className="input-group-btn">
                        <button id="createNewFolder" className="btn btn-default" type="submit">Create</button>
                    </span>
                </div>
            </div>
        </form>
        );
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var new_folder_name = this.refs.new_folder_name.getDOMNode().value.trim();
        if (!new_folder_name) {
            return;
        }
        this.refs.new_folder_name.getDOMNode().value = '';
        this.post("/folder/add", {'new-folder-name' : new_folder_name }, function() { });
    }
})

var FolderForm = React.createClass({
    mixins: [AjaxPoster],
    propTypes: {
        folders: React.PropTypes.array.isRequired
    },
    pickFolder: function(e) {
        e.preventDefault();
        this.post('/folder/pick', 
                  {'existing-folder': this.refs.folderpick.getValue()},
                  this.reload());
    },
    reload: function() {
        location.reload();
    },
    render: function() { return (
        <div id="quote-folder" className="tab-pane fade in active">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Pick a folder</h3>
                </div>
                <div className="panel-body">
                    <AddFolderForm/>
                    <form onSubmit={this.pickFolder} role="form">
                        <DjangoCSRF/>
                        <div className="form-group">
                            <label htmlFor="folder-pick">Pick an existing folder</label>
                            <div className="input-group">
                                <PrefilledSelector ref="folderpick" options={this.props.folders}/>
                                <span className="input-group-btn">
                                    <button id="pickExistingFolder" className="btn btn-default" type="submit">Pick</button>
                                </span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
    }
});

var FindByWordForm = React.createClass({
    mixins: [AjaxGetter],
    propTypes: {
        callbackDisplay: React.PropTypes.func.isRequired
    },
    render: function() { return (
        <form onSubmit={this.searchByWord} role="form">
            <DjangoCSRF/>
            <div className="form-group">
                <label htmlFor="find-word">By word in quote</label>
                <div className="input-group">
                    <input ref="word" type="text" className="form-control"/>
                    <span className="input-group-btn">
                        <button onClick={this.searchByWord} className="btn btn-default" type="button">Go</button>
                    </span>
                </div>
            </div>
        </form>
    );
    },
    searchByWord: function(e) {
        e.preventDefault();
        var word = this.refs.word.getDOMNode().value;
        this.get('/find/word/' + word, this.props.callbackDisplay);
    }
});

var FindBySourceForm = React.createClass({
    mixins: [AjaxGetter],
    propTypes: {
        sources: React.PropTypes.array.isRequired,
        callbackDisplay: React.PropTypes.func.isRequired
    },
    render: function() { return (
        <form onSubmit={this.searchBySource} role="form">
            <DjangoCSRF/>
            <div className="form-group">
                <label htmlFor="find-source">By source</label>
                <div className="input-group">
                    <PrefilledSelector ref="source" options={this.props.sources}/>
                    <span className="input-group-btn">
                        <button id="findBySource" onClick={this.searchBySource} className="btn btn-default" type="button">Go</button>
                    </span>
                </div>
            </div>
        </form>
        );
    },
    searchBySource: function(e) {
        e.preventDefault();
        var source = this.refs.source.getValue();
        this.get('/find/source/' + source, this.props.callbackDisplay);
    }
});

var FindByAuthorForm = React.createClass({
    mixins: [AjaxGetter],
    propTypes: {
        authors: React.PropTypes.array.isRequired,
        callbackDisplay: React.PropTypes.func.isRequired
    },
    render: function() { return (
        <form onSubmit={this.searchByAuthor} role="form">
            <DjangoCSRF/>
            <div className="form-group">
                <label htmlFor="find-author">By author</label>
                <div className="input-group">
                    <PrefilledSelector ref="author" options={this.props.authors}/>
                    <span className="input-group-btn">
                        <button onClick={this.searchByAuthor} className="btn btn-default" type="button">Go</button>
                    </span>
                </div>
            </div>
        </form>
    )},
    searchByAuthor: function(e) {
        e.preventDefault();
        var author = this.refs.author.getValue();
        this.get('/find/author/' + author, this.props.callbackDisplay);
    }
})

var FindForm = React.createClass({
    propTypes: {
        authors: React.PropTypes.array.isRequired,
        sources: React.PropTypes.array.isRequired
    },
    getInitialState: function() {
        return {'searchResults':[]}
    },
    callbackDisplay: function(data) {
        var results = [];
        for (var i = 0; i < data.length; i++) {
            results.push(
                <div className="panel panel-default">
                    <div className="panel-body">
                        {data[i].content}
                    </div>
                    <div className="panel-footer">
                        {data[i].source} - {data[i].page}
                    </div>
                </div>
            );
        }
        if (data.length == 0) {
            results.push(
                <div className="well">
                    No quotes to display !
                </div>
            );
        }
        this.setState({'searchResults': results});
    },
    render: function() { return (
        <div id="quote-find" className="tab-pane fade in">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Find a quote</h3>
                </div>
                <div className="panel-body">
                    <FindByWordForm callbackDisplay={this.callbackDisplay}/>
                    <FindBySourceForm callbackDisplay={this.callbackDisplay} sources={this.props.sources}/>
                    <FindByAuthorForm callbackDisplay={this.callbackDisplay} authors={this.props.authors}/>
                </div>
            </div>
            <div id="quote-find-results">
                {this.state.searchResults}
            </div>
        </div>
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
        var tags = this.state.selectedTags;
        var searched = tags.filter(function(x) { x.display == tag_display });
        to_remove = searched[0];
        var idx_to_remove = tags.indexOf(to_remove);
        tags.splice(idx_to_remove, 1);
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

var QuoteForm = React.createClass({
    mixins: [AjaxPoster, AjaxGetter],
    propTypes: {
        sources: React.PropTypes.array.isRequired,
        tags: React.PropTypes.array.isRequired,
        addTag: React.PropTypes.func.isRequired
    },
    getInitialState: function() { return {
            potentialAuthors: []
        }
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var authors = this.refs.authors.getValues();
        if (authors.length == 0) {
            alert('You must pick at least one author !');
            return;
        }
        var source = this.refs.source.getValue();
        var tags = this.refs.tags.getValues();
        var quote = this.refs.quote.getDOMNode().value;
        var page = this.refs.page.getDOMNode().value;
        var comment = this.refs.comment.getDOMNode().value;

        var quote_obj = {'source': source,
                         'authors': authors.toString(),
                         'content': quote,
                         'page' : page,
                         'tags' : JSON.stringify(tags),
                         'comment' : comment }
        this.post('quote/new', quote_obj, function() {
            var new_tags = tags.filter(function(x) { return x.key == 'new' });
            for (var i = 0; i < new_tags.length; i++) {
                this.props.addTag(new_tags[i]);
            }
        }.bind(this));
        this.empty();
    },
    empty: function() {
        this.refs.tags.empty();
        this.refs.quote.getDOMNode().value = '';
        this.refs.page.getDOMNode().value = '';
        this.refs.comment.getDOMNode().value = '';
    },
    updateAuthors: function(source) {
        if (source) {
            list_of_authors = this.get("/author/" + source + "/of", function(list_of_authors) {
                this.setState({potentialAuthors: list_of_authors});
            }.bind(this));
        }
    },
    componentDidMount: function() {
        this.updateAuthors();
    },
    render: function() { return (
        <div id="quote-add" className="tab-pane fade in">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Add a quote</h3>
                </div>
                <div className="panel-body">
                    <form role="form" onSubmit={this.handleSubmit}>
                        <DjangoCSRF/>
                        <div className="form-group">
                            <label htmlFor="source">Source</label>
                            <div className="input-group">
                                <PrefilledSelector ref="source" options={this.props.sources} callback={this.updateAuthors}/>
                                <span className="input-group-btn">
                                    <button className="btn btn-default" id="button-new-source" type="button">Add new</button>
                                </span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="author">Author</label>
                                <PrefilledMultiSelect ref="authors" options={this.state.potentialAuthors}/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="content">Quote</label>
                            <textarea ref="quote" className="form-control" rows="6" name="content"></textarea>
                        </div>
                        <div className="form-group">
                            <label htmlFor="page">Page / Localisation</label>
                            <input ref="page" type="text" name="quote-page" className="form-control"/>
                        </div>
                        <TagSelector ref="tags" tags={this.props.tags}/>
                        <div className="form-group">
                            <label htmlFor="comment">Comment</label>
                            <textarea ref="comment" className="form-control" rows="4" name="comment"></textarea>
                        </div>
                        <button type="submit" className="btn btn-default">Save</button>
                    </form>
                </div>
            </div>
        </div>
    );
    }
});

var InfiniteAuthorSelector = React.createClass({
    propTypes: {
        authors: React.PropTypes.array.isRequired
    },
    getInitialState: function() { 
        return { numAuthors: 1 }
    },
    empty: function() {
        this.refs[0].empty();
        this.setState({numAuthors:1});
    },
    propTypes: {
        authors: React.PropTypes.array.isRequired
    },
    addAuthor: function(e) {
        if (e) {
            e.preventDefault();
        }
        this.setState({numAuthors : this.state.numAuthors + 1});
    },
    reinitalize: function() {
        this.setState(getInitialState());
    },
    buildAuthors: function() {
        authors = [];
        for (i = 0; i < this.state.numAuthors; i++) {
            authors.push(
                <div className="input-group">
                    <PrefilledSelector options={this.props.authors} key={i} ref={i}/>
                    <span className="input-group-btn">
                        <button className="btn btn-default" id="button-new-author" type="button">Add new</button>
                    </span>
                </div>
            )
        }
        return authors;
    },
    getValue: function() {
        results = [];
        for (var i = 0; i < this.state.numAuthors; i++) {
            if (this.refs[i]) {
                results.push(this.refs[i].getValue());
            }
        }
        return results;
    },
    render: function() { 
        authors = this.buildAuthors();
        this.authors_input = authors;
        return (
            <div id="authors_for_source">
                <div className="form-group author-group">
                    <label htmlFor="source_author">Author(s)</label>
                    {authors}
                </div>
                <div className="form-group" id="source_author_adder">
                    <a onClick={this.addAuthor} href="#" id="source-author-add">Add another author to this source.</a>
                </div>
            </div>
        );
    }
});

var SingleMetadata = React.createClass({
    propTypes: {
        blurCallback: React.PropTypes.func.isRequired,
        childNumber: React.PropTypes.number.isRequired
    },
    onBlur: function() {
        if (this.refs.metadata2.getDOMNode().value) {
            this.props.blurCallback(this.props.childNumber);
        }
    },
    empty: function() {
        this.refs.metadata1.getDOMNode().value = '';
        this.refs.metadata2.getDOMNode().value = '';
    },
    getValue: function() {
        meta1 = this.refs.metadata1.getDOMNode().value;
        meta2 = this.refs.metadata2.getDOMNode().value;
        if (meta1 && meta2) {
            return [meta1, meta2];
        }
        return [];
    },
    render: function() {
        return (
            <div id="metadata-container">
                <div className="row">
                    <div className="col-xs-4">
                        <input ref="metadata1" name="metadata1" type="text" className="form-control" placeholder="Information"/>
                    </div>
                    <div className="col-xs-4">
                        <input ref="metadata2" name="metadata2" type="text" className="form-control" onBlur={this.onBlur} placeholder="Value"/>
                    </div>
                </div>
            </div>
        )
    }
});

var InfiniteMetadata = React.createClass({
    getInitialState: function() {
        return { metadataNumber: 1 }
    },
    empty: function() {
        this.refs[0].empty();
        this.setState({metadataNumber:1});
    },
    onChildBlur: function(child_key) {
        if (child_key === this.state.metadataNumber) {
            this.setState({metadataNumber : this.state.metadataNumber + 1});
        }
    },
    getValues: function() {
        values = {};
        for (var i = 0; i < this.state.metadataNumber; i++) {
            meta = this.refs[i].getValue();
            if (meta) {
                values[meta[0]] = meta[1];
            }
        }
        return values;
    },
    render: function() {
        var metadata = [];
        for (var i = 0; i < this.state.metadataNumber; i++) {
            metadata.push(
                <SingleMetadata ref={i} childNumber={i+1} blurCallback={this.onChildBlur}/>
            );
        }
        return (<div>{metadata}</div>);
    }
});

var SourceForm = React.createClass({
    mixins: [AjaxPoster],
    propTypes: {
        addSource: React.PropTypes.func.isRequired,
        authors: React.PropTypes.array.isRequired,
        sources: React.PropTypes.array.isRequired
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var title = this.refs.title.getDOMNode().value.trim();
        var authors = this.refs.authors.getValue();
        var metadata = this.refs.metadata.getValues();
        if (!title) {
            return;
        }
        this.refs.title.getDOMNode().value = '';
        this.refs.authors.empty();
        this.refs.metadata.empty();
        // Build source
        var newSource = { 'title' : title,
                          'authors' : authors.toString(),
                          'metadata' : JSON.stringify(metadata)}
        // Call adder...
        this.post('source/new', newSource, function(info) {
                this.props.addSource(info.newObject);
            }.bind(this));
    },
    render: function() { return (
        <div id="source-add" className="tab-pane fade in">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Add a source</h3>
                </div>
                <div className="panel-body">
                    <form role="form" onSubmit={this.handleSubmit}>
                        <DjangoCSRF/>
                        <InfiniteAuthorSelector ref="authors" authors={this.props.authors}/>
                        <div className="form-group">
                            <label htmlFor="title">Title</label>
                            <input type="text" name="title" ref="title" className="form-control"/>
                        </div>
                        <div className="form-group">
                            <label>Metadata</label>
                            <InfiniteMetadata ref="metadata"/>
                        </div>
                        <button type="submit" className="btn btn-default">Save</button>
                    </form>
                </div>
            </div>
        </div>
    );
    }
});

var AuthorForm = React.createClass({
    mixins: [AjaxPoster],
    propTypes: {
        addAuthor: React.PropTypes.func.isRequired,
        authors: React.PropTypes.array.isRequired
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var first_name = this.refs.author_first_name.getDOMNode().value.trim();
        var last_name = this.refs.author_last_name.getDOMNode().value.trim();
        var surname = this.refs.author_surname.getDOMNode().value.trim();
        if (!first_name && !last_name && !surname) {
            return;
        }
        this.refs.author_first_name.getDOMNode().value = '';
        this.refs.author_last_name.getDOMNode().value = '';
        this.refs.author_surname.getDOMNode().value = '';
        // Build author...
        var newAuthor = { 'first_name' : first_name,
                          'last_name' : last_name,
                          'surname' : surname }
        // Call adder...
        this.post('author/new', newAuthor, function(info) {
                this.props.addAuthor(info.newObject);
            }.bind(this));
    },
    render: function() { return (
        <div id="author-add" className="tab-pane fade in">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Add an author</h3>
                </div>
                <div className="panel-body">
                    <form role="form" onSubmit={this.handleSubmit}>
                        <DjangoCSRF/>
                        <div className="form-group">
                            <label htmlFor="author_first_name">First name</label>
                            <input type="text" ref="author_first_name" className="form-control"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="author_last_name">Last name</label>
                            <input type="text" ref="author_last_name" className="form-control"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="author_surname">Surname</label>
                            <input type="text" ref="author_surname" className="form-control"/>
                        </div>
                        <button type="submit" className="btn btn-default">Save</button>
                    </form>
                </div>
            </div>
        </div>
    );
    }
});

/** Django CSRF **/
var DjangoCSRF = React.createClass({
    render: function() { 
        var csrfToken = getCookie('csrftoken');
        return React.DOM.input(
              {type:"hidden", name:"csrfmiddlewaretoken", value:csrfToken}
        );
    }
});

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
function sameOrigin(url) {
    // test that a given url is a same-origin URL
    // url could be relative or scheme relative or absolute
    var host = document.location.host; // host + port
    var protocol = document.location.protocol;
    var sr_origin = '//' + host;
    var origin = protocol + sr_origin;
    // Allow absolute or scheme relative URLs to same origin
    return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
        (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
        // or any other URL that isn't scheme relative or absolute i.e relative.
        !(/^(\/\/|http:|https:).*/.test(url));
}
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
        // Send the token to same-origin, relative URLs only.
        // Send the token only if the method warrants CSRF protection
        // Using the CSRFToken value acquired earlier
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        }
    }
});
