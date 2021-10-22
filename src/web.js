
import axios from "axios"
let web = {}

web.getProject = async function() {
	const params = new URLSearchParams(window.location.search);
	const node_id = params.get("node");
	var node_data = await axios.get(`/api/v2/nodes/${node_id}`)
	const project_id = node_data.data.project
	var project_data = await axios.get(`/api/v2/projects/${project_id}`)
	var current_node = project_data.data.nodes.find(node => node._id === node_id)
	var current_collection = project_data.data.collections.find(col => col.name === current_node.collection)
	var out = {
		title: project_data.data.title,
		node: current_node,
		collection: current_collection
	}
	return out
}

web.getData = async function(collection, only_matched, match) {
	var query = `{"$or":[{"${match}": {"$exists":false}}, {"${match}":""}]}`
	var result
	if(only_matched === 'yes')
		result = await axios.get(`/api/v2/collections/${collection}/docs?mongoquery=${query}`)
	else
		result = await axios.get(`/api/v2/collections/${collection}/docs`)
	return result
}

web.getStats = async function(collection, match) {
	var query = `{"$or":[{"${match}": {"$exists":false}}, {"${match}":""}]}`
	var total = await axios.get(`/api/v2/collections/${collection}/count`)
	var nonmatched = await axios.get(`/api/v2/collections/${collection}/count?mongoquery=${query}`)
	var out = {total: total.data.count, non_matched: nonmatched.data.count}
	return out
}

web.setData = async function(collection, doc_id, data) {
	var result = await axios.put(`/api/v2/collections/${collection}/docs/${doc_id}`, data)
	return result
}

web.getURLQueryParamsAsString = function() {
	var url = document.URL.split('?')
	if(url.length == 2)
		return url[1].replace(/\?/g, '')
	else
		return ''
}

export default web
