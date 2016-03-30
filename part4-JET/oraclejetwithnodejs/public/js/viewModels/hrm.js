/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/* 
 * Your viewModel code goes here
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojmodel', 'ojs/ojknockout-model', 'ojs/ojknockout','ojs/ojmodel', 'promise',  'ojs/ojtable',  'ojs/ojarraytabledatasource','ojs/ojcollectiontabledatasource'],
  function(oj, ko) {
   /**
    * The view model for the main content view template
    */

    function hrmViewModel() {
        var self = this;
		//var dataAPI_URL = 'https://data-api-lucasjellema.apaas.em2.oraclecloud.com/departments';
		var dataAPI_URL = 'http://127.0.0.1:3000/departments';

		self.DeptCol = ko.observable();
        self.dataSource = ko.observable();
		
		self.Department = oj.Model.extend({
            urlRoot: dataAPI_URL,
            parse: function(response) {
            return {DepartmentId: response['DEPARTMENT_ID'],
                    DepartmentName: response['DEPARTMENT_NAME'],
                    Location:'Zoetermeer'};
                   },
            idAttribute: 'DepartmentId'
        });
		
		self.DeptCollection = oj.Collection.extend({
           url: dataAPI_URL,
           model: new self.Department()
        });
        self.DeptCol(new self.DeptCollection());
        new self.Department().fetch({
                success: function(coll, response, options) {
				 self.dataSource(new oj.CollectionTableDataSource(self.DeptCol()));
                }
            });

    }// hrmViewModel       
   
   return  hrmViewModel();
});
 