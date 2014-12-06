buildQuoter = function(folders_array, tags_array) {
    React.render(<QuoterMenu folders={folders_array} tags={tags_array}/>, document.getElementById('quoterForms'));
    React.render(<QuoterAccess/>, document.getElementById('main-menu-container'));
}

var QuoterMenu = React.createClass({
    propTypes: {
        folders: React.PropTypes.array.isRequired,
        tags: React.PropTypes.array.isRequired
    },
    render: function() { return (
        <div className="tab-content">
            <FolderForm folders={this.props.folders}/>
            <FindForm/>
            <QuoteForm/>
            <SourceForm/>
            <AuthorForm/>
        </div>
    );
    }
});

var PrefilledSelector = React.createClass({
    propTypes: {
        options: React.PropTypes.array.isRequired
    },
    getInitialState: function() {
        return {
            options: []
        }
    },
    componentWillMount: function() {
        this.buildOptions();
    },
    buildOptions: function() {
        for (var i = 0; i < this.props.options.length; i++) {
            var option = this.props.options[i];
            this.addOption(i, option);
        }
    },
    addOption: function(idx, option) {
        this.state.options.push(
            <option key={idx} value={option.key}>{option.value}</option>
        )
    },
    render: function() { return (
        <select className="form-control">
            {this.state.options}
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
    propTypes : { paneModels: React.PropTypes.array.isRequired,
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
                callback();
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
                <label for="folder-name">New folder name</label>
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
                            <label for="folder-pick">Pick an existing folder</label>
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

var FindForm = React.createClass({
    render: function() { return (
        <div id="quote-find" className="tab-pane fade in">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Find a quote</h3>
                </div>
                <div className="panel-body">
                    <form role="form">
                        <DjangoCSRF/>
                        <div className="form-group">
                            <label for="find-word">By word in quote</label>
                            <div className="input-group">
                                <input type="text" name="find-word" className="form-control"/>
                                <span className="input-group-btn">
                                    <button id="findByWord" className="btn btn-default" type="button">Go</button>
                                </span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label for="find-source">By source</label>
                            <div className="input-group">
                                <select className="form-control" name="find-source">
                                </select>
                                <span className="input-group-btn">
                                    <button id="findBySource" className="btn btn-default" type="button">Go</button>
                                </span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label for="find-author">By author</label>
                            <div className="input-group">
                                <select className="form-control" name="find-author">
                                </select>
                                <span className="input-group-btn">
                                    <button id="findByAuthor" className="btn btn-default" type="button">Go</button>
                                </span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <div id="quote-find-results"></div>
        </div>
    );
    }
});

var QuoteForm = React.createClass({
    render: function() { return (
        <div id="quote-add" className="tab-pane fade">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Add a quote</h3>
                </div>
                <div className="panel-body">
                    <form role="form">
                        <DjangoCSRF/>
                        <div className="form-group">
                            <label for="source">Source</label>
                            <div className="input-group">
                                <select id="quote-add-source" className="form-control" name="source">
                                </select>
                                <span className="input-group-btn">
                                    <button className="btn btn-default" id="button-new-source" type="button">Add new</button>
                                </span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label for="author">Author</label>
                            <div className="input-group">
                                <select multiple id="quote-add-author" className="form-control" name="author">
                                </select>
                                <span className="input-group-btn">
                                    <button className="btn btn-default" id="button-new-author" type="button">Add new</button>
                                </span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label for="content">Quote</label>
                            <textarea className="form-control" rows="6" name="content"></textarea>
                        </div>
                        <div className="form-group">
                            <label for="page">Page / Localisation</label>
                            <input type="text" name="quote-page" className="form-control"/>
                        </div>
                        <div className="form-group">
                            <label for="page">Tag</label>
                            <input id="quote-tag-autocomplete" type="text" name="quote-tag" className="form-control typeahead"/>
                            <input type="hidden" value="" name="current-tag-value"/>
                        </div>
                        <div id="quote-tag-container">
                            <input type="hidden" value="" name="quote-tags"/>
                        </div>
                        <div className="form-group">
                            <label for="comment">Comment</label>
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

var SourceForm = React.createClass({
    render: function() { return (
        <div id="source-add" className="tab-pane fade">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Add a source</h3>
                </div>
                <div className="panel-body">
                    <form role="form">
                        <DjangoCSRF/>
                        <div className="form-group author-group">
                            <label for="source-author">Author(s)</label>
                            <div className="input-group">
                                <select id="source-add-author" className="form-control" name="source-author">
                                </select>
                                <span className="input-group-btn">
                                    <button className="btn btn-default" id="button-new-author" type="button">Add new</button>
                                </span>
                            </div>
                        </div>
                        <div className="form-group" id="source-author-adder">
                            <a href="#" id="source-author-add">Add another author to this source.</a>
                        </div>
                        <div className="form-group">
                            <label for="title">Title</label>
                            <input type="text" name="title" className="form-control"/>
                        </div>
                        <div className="form-group">
                            <label>Metadata</label>
                            <div id="metadata-container">
                                <div className="row">
                                    <div className="col-xs-4">
                                        <input name="metadata1" type="text" className="form-control" placeholder="Information"/>
                                    </div>
                                    <div className="col-xs-4">
                                        <input name="metadata2" type="text" className="form-control metadata-last" placeholder="Value"/>
                                    </div>
                                </div>
                            </div>
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
    render: function() { return (
        <div id="author-add" className="tab-pane fade">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Add an author</h3>
                </div>
                <div className="panel-body">
                    <form role="form">
                        <DjangoCSRF/>
                        <div className="form-group">
                            <label for="author-first-name">First name</label>
                            <input type="text" name="author-first-name" className="form-control"/>
                        </div>
                        <div className="form-group">
                            <label for="author-last-name">Last name</label>
                            <input type="text" name="author-last-name" className="form-control"/>
                        </div>
                        <div className="form-group">
                            <label for="author-surname">Surname</label>
                            <input type="text" name="author-surname" className="form-control"/>
                        </div>
                        <button type="submit" className="btn btn-default">Save</button>
                    </form>
                </div>
            </div>
        </div>
    );
    }
});

var DjangoCSRF = React.createClass({
    render: function() { 
        var csrfToken = getCookie('csrftoken');
        return React.DOM.input(
              {type:"hidden", name:"csrfmiddlewaretoken", value:csrfToken}
        );
    }
});


/** Django CSRF **/
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
