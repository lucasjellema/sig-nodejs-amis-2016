module.exports = function (basepath) {
return {
process: function (req, res) {
res.sendFile('templates/' + req.params.name, {root: basepath + '/views/'});
}
};
}