"use strict";
var React = require('react');
var common = require('./common.js');
var DjangoCSRF = require('./csrf.js');

var SearchResult = React.createClass({
    propTypes: {
        quote_id: React.PropTypes.number.isRequired,
        content: React.PropTypes.string.isRequired,
        source: React.PropTypes.string.isRequired,
        page: React.PropTypes.string.isRequired
    },
    editQuote: function(quote) {
    },
    render: function() { return (
        <div className="panel panel-default">
            <div className="panel-body">
                {this.props.content}
            </div>
            <div className="panel-footer">
                {this.props.source} - {this.props.page}
                <button onClick={this.editQuote} className="btn btn-default">Edit</button>
            </div>
        </div>
        );
    }
});

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
                <SearchResult quote_id = {data[i].value} content = {data[i].content}
                              source = {data[i].source} page = {data[i].page}/>
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

var FindByWordForm = React.createClass({
    mixins: [common.AjaxGetter],
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
    mixins: [common.AjaxGetter],
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
                    <common.PrefilledSelector ref="source" options={this.props.sources}/>
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
    mixins: [common.AjaxGetter],
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
                    <common.PrefilledSelector ref="author" options={this.props.authors}/>
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
});

module.exports = FindForm
