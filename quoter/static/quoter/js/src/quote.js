"use strict";
var React = require('react');
var common = require('./common.js');
var DjangoCSRF = require('./csrf.js');
var TagSelector = require('./tags.js');

var QuoteForm = React.createClass({
    mixins: [common.AjaxPoster, common.AjaxGetter, common.Editable],
    propTypes: {
        sources: React.PropTypes.array.isRequired,
        tags: React.PropTypes.array.isRequired,
        addTag: React.PropTypes.func.isRequired
    },
    getInitialState: function() { return {
            potentialAuthors: []
        }
    },
    load: function(data) {
        this.refs.source.setValue(data.source, this.refs.tags.setValues(data.tags));
        this.refs.quote.getDOMNode().value = data.content;
        this.refs.page.getDOMNode().value = data.page;
        this.refs.comment.getDOMNode().value = data.comment;
        this.refs.authors.setValues(data.authority);
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
        var adder = function(info) {
            var new_tags = info.newObject
            for (var i = 0; i < new_tags.length; i++) {
                this.props.addTag(new_tags[i]);
            }
        }.bind(this);
        if (this.state.inEditMode) {
            this.sendUpdate(quote_obj, adder);
        } else {
            this.post('quote/new', quote_obj, adder);
        }
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
            this.get("/author/" + source + "/of", function(list_of_authors) {
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
                                <common.PrefilledSelector ref="source" options={this.props.sources} callback={this.updateAuthors}/>
                                <span className="input-group-btn">
                                    <button className="btn btn-default" id="button-new-source" type="button">Add new</button>
                                </span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="author">Author</label>
                                <common.PrefilledMultiSelect ref="authors" options={this.state.potentialAuthors}/>
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
                        <button type="submit" className="btn btn-default">{this.saveOrModify()}</button>
                    </form>
                </div>
            </div>
        </div>
    );
    }
});

module.exports = QuoteForm
