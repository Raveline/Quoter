
buildQuoter = function(folders_array, tags_array) {
    React.render(<QuoterMenu folders={folders_array} tags={tags_array}/>, document.getElementById('quoterForms'));
    React.render(<QuoterAccess/>, document.getElementById('main-menu-container'));
}
