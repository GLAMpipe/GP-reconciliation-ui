
<template>
	<div>
		<div class="alert alert-danger" v-if="error">{{error}}</div>
		<b-navbar toggleable="lg" type="dark" variant="info">
			<b-navbar-brand href="">Reconciliation matching for <b><span v-if="project">{{project.title}}: {{project.collection.title}}</span></b></b-navbar-brand>

			<b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

			<b-collapse id="nav-collapse" is-nav>


				<!-- Right aligned nav items -->
				<b-navbar-nav class="ml-auto">
					<b-navbar-nav>
						<!--<b-nav-item @click="resetView()" href="#">Reset View</b-nav-item>-->
					</b-navbar-nav>
				</b-navbar-nav>
			</b-collapse>
		</b-navbar>


		<b-row>
			<b-col cols="3"  class="sideBar">
				<b-card>
					<p>Choose best match and click select.</p>
					<div>
						<b-form-checkbox
							id="checkbox-1"
							v-model="show_only_non_matched"
							name="checkbox-1"
							value="yes"
							unchecked-value="no"
						>
						Show only non-matched
						</b-form-checkbox>
					</div>
					<br><table class="table b-table table-striped" v-if="project">
						<tr>
							<td>query field</td>
							<td>{{project.node.params.in_field}}</td>
						</tr>
						<tr>
							<td>class limit</td>
							<td>{{project.node.settings.in_class_select}}</td>
						</tr>
					</table>
				</b-card>
			</b-col>

			<b-col cols="9">
				<DBDataTable ref="table" :project="project" :show_only_non_matched="show_only_non_matched"/>
			</b-col>
		</b-row>
	</div>
</template>
<script>


import DBDataTable from './components/DBDataTable.vue'
import web from './web.js'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'


export default {
	name: 'App',
	components: { DBDataTable},
	data() {
		return {
			project: null,
			show_only_non_matched: false,
			error: null
		}
	},
	mounted: async function () {
		this.project = await web.getProject()
	}
}
</script>
