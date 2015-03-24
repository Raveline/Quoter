"use strict";
var React = require('react');
var $ = require('jquery');
var utils = require('./utils.js');
var AuthorForm = require('./author.js');
var SourceForm = require('./source.js');
var QuoteForm = require('./quote.js');
var FolderForm = require('./folders.js');
var FindForm = require('./finders.js');


var QuoterMenu = React.createClass({
    propTypes: {
        folders: React.PropTypes.array.isRequired,
        tags: React.PropTypes.array.isRequired,
        tabHandler: React.PropTypes.func.isRequired
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
        utils.removeFromIfExist(authors, function(x) { return x.value == author.value });
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
        utils.removeFromIfExist(sources, function(x) { return x.value == source.value });
        sources = sources.concat(source);
        this.setState({sources: sources});
    },
    quoteEdit: function(idx_quote) {
        this.refs.quote.getObjectAndLoad(idx_quote);
        this.props.tabHandler(2);
    },
    render: function() { 
        return (
        <div className="tab-content">
            <FolderForm folders={this.props.folders}/>
            <FindForm tags = {this.state.tags} sources={this.state.sources} authors={this.state.authors}
                      quoteEdit = {this.quoteEdit}/>
            <QuoteForm ref="quote" authors={this.state.authors} sources={this.state.sources} tags={this.state.tags} 
                      addTag={this.addTag} url_get="/quote/load/" url_modify="/quote/update/"/>
            <SourceForm authors={this.state.authors} sources={this.state.sources} addSource={this.addSource}
                        modifiables={this.state.sources} url_get="/source/load/" url_modify="/source/update/"/>
            <AuthorForm authors={this.state.authors} addAuthor={this.addAuthor} 
                        modifiables={this.state.authors} url_get="/author/load/" url_modify="/author/update/"/>
        </div>
    );
    }
});

module.exports = QuoterMenu
