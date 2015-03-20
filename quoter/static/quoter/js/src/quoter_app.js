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
        removeFromIfExist(authors, function(x) { return x.value == author.value });
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
            <SourceForm authors={this.state.authors} sources={this.state.sources} addSource={this.addSource}
                        modifiables={this.state.sources} url_get="/source/load/" url_modify="/source/update/"/>
            <AuthorForm authors={this.state.authors} addAuthor={this.addAuthor} 
                        modifiables={this.state.authors} url_get="/author/load/" url_modify="/author/update/"/>
        </div>
    );
    }
});

