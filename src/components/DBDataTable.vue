<template>
	<div class="data">

		<template v-if="project && project.node.settings">
			matched: {{stats.total - stats.non_matched}}/{{stats.total}}
			<div v-if="stats.total && stats.non_matched == 0" class="alert alert-success">All done!</div>
			<template v-if="data.length > 0">
				<b-table striped hover :items="data" :fields="fields">
					<template v-slot:[`cell(${suggestions_field})`]="data">
						<div v-html="formatReconciliationResult(data.value, data.item)"></div>
					</template>

					<template v-slot:[`cell(${match_field})`]="data">
						<div v-html="formatReconciliationMatch(data.value, data.item)"></div>
					</template>
				</b-table>
			</template>
		</template>
		<div v-else>
			<div class="alert alert-warning">Did not find reconciliation data! Did you run reconciliation node?</div>
		</div>

	</div>
</template>

<script>

import web from './../web.js'

export default {
	name: 'DBDataTable',
	props: ['show_only_non_matched', 'project'],
	data() {
		return {
			stats: {total:-1, non_matched:0},
			data: [],
			fields: [],
			suggestions_field: '',
			match_field: ''
		}
	},
	methods: {
		formatNoMatch(wd_result, data) {
			return `<button onclick="window.table.setSelection('${data._id}', 'none')" title="Click if there is no good suggestion" class="btn btn-outline-primary">No good match!</button>`
		},
		formatReconciliationResult(wd_result, data) {
			var out = '<table>'
			if(data[this.match_field]) {
				return `<button class="btn btn-outline-primary" onclick="window.table.setSelection('${data._id}', '')">Change selection </button> (${wd_result.result.length} suggestions)`
			}
			if(wd_result.result) {
				for(var r of wd_result.result) {
					if(r.match) {
						out += `<b class="text-info">${r.name} ${r.id}</b>`
						out += `<button onclick="window.table.setSelection('${data._id}', 'none')" title="Click if there is no good suggestion" class="btn btn-outline-primary">No good match!</button>`
					} else {
						var score = `${r.score}`
						if(r.score == 100) score = `<b>${r.score}</b>`
						out += `<tr><td style="width:35%"><b>${r.name}</b><br> (${this.getTypes(r.type)})</td>`
						out += `<td><a target="_blank" href="https://www.wikidata.org/wiki/${r.id}">${r.id}</a></td>`
						out += `<td>${score}`
						for(var fe of r.features) {
							out += `<div>${fe.id} : ${fe.value}</div>`
						}
						out += `</td><td><button onclick="window.table.setSelection('${data._id}', '${r.id}')" class="btn btn-primary" type="button">select</button></td><tr>`
					}
				}
			}
			out += `<tr><td></td><td></td><td></td><td><button onclick="window.table.setSelection('${data._id}', 'none')" title="Click if there is no good suggestion" class="btn btn-outline-primary">No good match!</button></td></tr>`
			return out + '</table>'
		},
		formatReconciliationMatch(wd_match, data) {
			return this.pickWID(wd_match, data)
		},
		getTypes(types) {
			var type_names = types.map(x => x.name)
			return type_names.join(', ')
		},
		pickWID(wid, data) {
			var out = ''
			if(data[this.suggestions_field] && data[this.suggestions_field].result) {

				if(wid === 'none') {
					return 'No good match found!'
				} else {
					for(var r of data[this.suggestions_field].result) {
						if(r.id == wid) {
							out += `<b class="text-info">${r.name} (<a href="">${r.id}</a>)</b>`
						}
					}
				}
			}

			return out
		},
		async setSelection(doc_id, selection) {
			var data = {}
			data[this.match_field] = selection
			await web.setData(this.project.collection.name, doc_id, data)
			await this.getData()
		},
		async getData() {
			let result = await web.getData(this.project.collection.name, this.show_only_non_matched, this.match_field)
			this.data = result.data.data
			this.stats = await web.getStats(this.project.collection.name, this.match_field)
		}
	},

	watch: {
		show_only_non_matched: async function() {
			await this.getData()
		},
		project: async function() {
			if(this.project.node) {
				this.suggestions_field = this.project.node.params.out_result
				this.match_field = this.project.node.params.out_match
				this.fields = this.fields.concat([this.project.node.params.in_field, this.suggestions_field, this.match_field])
				await this.getData()
			}
		}
	},
	mounted: async function () {
		window.table = this; // hackish: expose methods for plain js "select" buttons

		//const params = new URLSearchParams(window.location.search);
		//this.fields = params.get("fields").split(',');

	}
}

</script>
