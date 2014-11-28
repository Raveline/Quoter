var QuoterMenu = React.createClass({
    render: function() { return (
        <div class="tab-content">
            <FolderForm/>
            <FindForm/>
            <QuoteForm/>
            <SourceForm/>
            <AuthorForm/>
        </div>
    );
    }
});

var FolderForm = React.createClass({
    render: function() { return (
        <div id="quote-folder" class="tab-pane fade in active">
            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title">Pick a folder</h3>
                </div>
                <div class="panel-body">
                    <form method="POST" action="/folder/add" role="form">
                        <DjangoCSRF/>
                        <div class="form-group">
                            <label for="folder-name">New folder name</label>
                            <div class="input-group">
                                <input type="text" name="new-folder-name" class="form-control"/>
                                <span class="input-group-btn">
                                    <button id="createNewFolder" class="btn btn-default" type="submit">Create</button>
                                </span>
                            </div>
                        </div>
                    </form>
                    <form method="POST" action="/folder/pick" role="form">
                        <DjangoCSRF/>
                        <div class="form-group">
                            <label for="folder-pick">Pick an existing folder</label>
                            <div class="input-group">
                                <FolderPicker/>
                                <span class="input-group-btn">
                                    <button id="pickExistingFolder" class="btn btn-default" type="submit">Pick</button>
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
        <div id="quote-find" class="tab-pane fade in">
            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title">Find a quote</h3>
                </div>
                <div class="panel-body">
                    <form role="form">
                        <DjangoCSRF/>
                        <div class="form-group">
                            <label for="find-word">By word in quote</label>
                            <div class="input-group">
                                <input type="text" name="find-word" class="form-control"/>
                                <span class="input-group-btn">
                                    <button id="findByWord" class="btn btn-default" type="button">Go</button>
                                </span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="find-source">By source</label>
                            <div class="input-group">
                                <select class="form-control" name="find-source">
                                </select>
                                <span class="input-group-btn">
                                    <button id="findBySource" class="btn btn-default" type="button">Go</button>
                                </span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="find-author">By author</label>
                            <div class="input-group">
                                <select class="form-control" name="find-author">
                                </select>
                                <span class="input-group-btn">
                                    <button id="findByAuthor" class="btn btn-default" type="button">Go</button>
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
        <div id="quote-add" class="tab-pane fade">
            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title">Add a quote</h3>
                </div>
                <div class="panel-body">
                    <form role="form">
                        <DjangoCSRF/>
                        <div class="form-group">
                            <label for="source">Source</label>
                            <div class="input-group">
                                <select id="quote-add-source" class="form-control" name="source">
                                </select>
                                <span class="input-group-btn">
                                    <button class="btn btn-default" id="button-new-source" type="button">Add new</button>
                                </span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="author">Author</label>
                            <div class="input-group">
                                <select multiple id="quote-add-author" class="form-control" name="author">
                                </select>
                                <span class="input-group-btn">
                                    <button class="btn btn-default" id="button-new-author" type="button">Add new</button>
                                </span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="content">Quote</label>
                            <textarea class="form-control" rows="6" name="content"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="page">Page / Localisation</label>
                            <input type="text" name="quote-page" class="form-control"/>
                        </div>
                        <div class="form-group">
                            <label for="page">Tag</label>
                            <input id="quote-tag-autocomplete" type="text" name="quote-tag" class="form-control typeahead"/>
                            <input type="hidden" value="" name="current-tag-value"/>
                        </div>
                        <div id="quote-tag-container">
                            <input type="hidden" value="" name="quote-tags"/>
                        </div>
                        <div class="form-group">
                            <label for="comment">Comment</label>
                            <textarea class="form-control" rows="4" name="comment"></textarea>
                        </div>
                        <button type="submit" class="btn btn-default">Save</button>
                    </form>
                </div>
            </div>
        </div>

    );
    }
});

var QuoterMenu = React.createClass({
    render: function() { return (
        <div id="source-add" class="tab-pane fade">
            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title">Add a source</h3>
                </div>
                <div class="panel-body">
                    <form role="form">
                        <DjangoCSRF/>
                        <div class="form-group author-group">
                            <label for="source-author">Author(s)</label>
                            <div class="input-group">
                                <select id="source-add-author" class="form-control" name="source-author">
                                </select>
                                <span class="input-group-btn">
                                    <button class="btn btn-default" id="button-new-author" type="button">Add new</button>
                                </span>
                            </div>
                        </div>
                        <div class="form-group" id="source-author-adder">
                            <a href="#" id="source-author-add">Add another author to this source.</a>
                        </div>
                        <div class="form-group">
                            <label for="title">Title</label>
                            <input type="text" name="title" class="form-control"/>
                        </div>
                        <div class="form-group">
                            <label>Metadata</label>
                            <div id="metadata-container">
                                <div class="row">
                                    <div class="col-xs-4">
                                        <input name="metadata1" type="text" class="form-control" placeholder="Information"/>
                                    </div>
                                    <div class="col-xs-4">
                                        <input name="metadata2" type="text" class="form-control metadata-last" placeholder="Value"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-default">Save</button>
                    </form>
                </div>
            </div>
        </div>
    );
    }
});


var AuthorMenu = React.createClass({
    render: function() { return (
        <div id="author-add" class="tab-pane fade">
            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title">Add an author</h3>
                </div>
                <div class="panel-body">
                    <form role="form">
                        <DjangoCSRF/>
                        <div class="form-group">
                            <label for="author-first-name">First name</label>
                            <input type="text" name="author-first-name" class="form-control"/>
                        </div>
                        <div class="form-group">
                            <label for="author-last-name">Last name</label>
                            <input type="text" name="author-last-name" class="form-control"/>
                        </div>
                        <div class="form-group">
                            <label for="author-surname">Surname</label>
                            <input type="text" name="author-surname" class="form-control"/>
                        </div>
                        <button type="submit" class="btn btn-default">Save</button>
                    </form>
                </div>
            </div>
        </div>
    );
    }
});

var DjangoCSRF = React.createClass({
    render: function() { return (
        <div class="tab-content">
            <FolderForm/>
            <FindForm/>
            <QuoteForm/>
            <SourceForm/>
            <AuthorForm/>
        </div>
    );
    }
});

$(document).ready(function() {
    React.render(<QuoterMenu/>, document.getElementById('quoterForms'));
});
