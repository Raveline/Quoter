buildQuoter = function(folders_array, tags_array) {
    React.render(<QuoterMenu folders={folders_array} tags={tags_array}/>, document.getElementById('quoterForms'));
    React.render(<QuoterAccess/>, document.getElementById('main-menu-container'));
}

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
    buildState: function() {
        for (var i = 0; i < this.props.folders.lenght; i++) {
        }
    },
    addAuthor: function(author) {
        var authors = this.state.authors;
        authors = authors.concat(author);
        this.setState({authors: authors});
    },
    addTag: function() {
    },
    addSource: function(source) {
        var sources = this.state.sourcesj;
        sources.concat(source);
        this.setState({sources: sources});
    },
    render: function() { 
        return (
        <div className="tab-content">
            <FolderForm folders={this.props.folders}/>
            <FindForm tags = {this.state.tags} sources={this.state.sources} authors={this.state.authors} />
            <QuoteForm/>
            <SourceForm authors={this.state.authors} sources={this.state.sources} addSource={this.addSource}/>
            <AuthorForm authors={this.state.authors} addAuthor={this.addAuthor}/>
        </div>
    );
    }
});

var PrefilledSelector = React.createClass({
    propTypes: {
        options: React.PropTypes.array.isRequired,
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
        }
    },
    handleChange: function() {
        var newValue = this.refs.selector.getDOMNode().value;
        this.setState({'selected':newValue});
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
        this.post("/folder/add", {'new-folder-name' : new_folder_name }, function() { console.log('DONE !') });
    }
})

var FolderForm = React.createClass({
    propTypes: {
        folders: React.PropTypes.array.isRequired
    },
    render: function() { return (
        <div id="quote-folder" className="tab-pane fade in active">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Pick a folder</h3>
                </div>
                <div className="panel-body">
                    <AddFolderForm/>
                    <form method="POST" action="/folder/pick" role="form">
                        <DjangoCSRF/>
                        <div className="form-group">
                            <label htmlFor="folder-pick">Pick an existing folder</label>
                            <div className="input-group">
                                <PrefilledSelector options={this.props.folders}/>
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
    render: function() { return (
        <form role="form">
            <DjangoCSRF/>
            <div className="form-group">
                <label htmlFor="find-word">By word in quote</label>
                <div className="input-group">
                    <input type="text" name="find-word" className="form-control"/>
                    <span className="input-group-btn">
                        <button id="findByWord" className="btn btn-default" type="button">Go</button>
                    </span>
                </div>
            </div>
        </form>
    );
    }
});

var FindBySourceForm = React.createClass({
    render: function() { return (
        <form role="form">
            <DjangoCSRF/>
            <div className="form-group">
                <label htmlFor="find-source">By source</label>
                <div className="input-group">
                    <select className="form-control" name="find-source">
                    </select>
                    <span className="input-group-btn">
                        <button id="findBySource" className="btn btn-default" type="button">Go</button>
                    </span>
                </div>
            </div>
        </form>
        );
    }
});

var FindByAuthorForm = React.createClass({
    render: function() { return (
        <form role="form">
            <DjangoCSRF/>
            <div className="form-group">
                <label htmlFor="find-author">By author</label>
                <div className="input-group">
                    <select className="form-control" name="find-author">
                    </select>
                    <span className="input-group-btn">
                        <button id="findByAuthor" className="btn btn-default" type="button">Go</button>
                    </span>
                </div>
            </div>
        </form>
    )}
})

var FindForm = React.createClass({
    render: function() { return (
        <div id="quote-find" className="tab-pane fade in">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Find a quote</h3>
                </div>
                <div className="panel-body">
                    <FindByWordForm/>
                    <FindBySourceForm/>
                    <FindByAuthorForm/>
                </div>
            </div>
            <div id="quote-find-results"></div>
        </div>
    );
    }
});

var QuoteForm = React.createClass({
    render: function() { return (
        <div id="quote-add" className="tab-pane fade in">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Add a quote</h3>
                </div>
                <div className="panel-body">
                    <form role="form">
                        <DjangoCSRF/>
                        <div className="form-group">
                            <label htmlFor="source">Source</label>
                            <div className="input-group">
                                <select id="quote-add-source" className="form-control" name="source">
                                </select>
                                <span className="input-group-btn">
                                    <button className="btn btn-default" id="button-new-source" type="button">Add new</button>
                                </span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="author">Author</label>
                            <div className="input-group">
                                <select multiple id="quote-add-author" className="form-control" name="author">
                                </select>
                                <span className="input-group-btn">
                                    <button className="btn btn-default" id="button-new-author" type="button">Add new</button>
                                </span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="content">Quote</label>
                            <textarea className="form-control" rows="6" name="content"></textarea>
                        </div>
                        <div className="form-group">
                            <label htmlFor="page">Page / Localisation</label>
                            <input type="text" name="quote-page" className="form-control"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="page">Tag</label>
                            <input id="quote-tag-autocomplete" type="text" name="quote-tag" className="form-control typeahead"/>
                            <input type="hidden" value="" name="current-tag-value"/>
                        </div>
                        <div id="quote-tag-container">
                            <input type="hidden" value="" name="quote-tags"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="comment">Comment</label>
                            <textarea className="form-control" rows="4" name="comment"></textarea>
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
    onChildBlur: function(child_key) {
        console.log(child_key);
        if (child_key === this.state.metadataNumber) {
            this.setState({metadataNumber : this.state.metadataNumber + 1});
        }
        console.log(this.getValues());
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
    propTypes: {
        addSource: React.PropTypes.func.isRequired,
        authors: React.PropTypes.array.isRequired,
        sources: React.PropTypes.array.isRequired
    },
    render: function() { return (
        <div id="source-add" className="tab-pane fade in">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Add a source</h3>
                </div>
                <div className="panel-body">
                    <form role="form">
                        <DjangoCSRF/>
                        <InfiniteAuthorSelector authors={this.props.authors}/>
                        <div className="form-group">
                            <label htmlFor="title">Title</label>
                            <input type="text" name="title" className="form-control"/>
                        </div>
                        <div className="form-group">
                            <label>Metadata</label>
                            <InfiniteMetadata/>
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
