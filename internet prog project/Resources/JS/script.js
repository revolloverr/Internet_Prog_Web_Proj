$(document).ready(function(){
	getXML();
});


function getXML(){
$.ajax({
	url: "data/categories.xml",
	dataType: "xml",
	success: function(xmlData){
		allCategories=[];
		
		$(xmlData).find('category').each(function(){
			const $category = $(this);
			const categoryName = $category.find('name').text();
			
		allCategories.push({
			name: categoryName,
			slug: slugifyCategory(categoryName),
			description: $category.find('description').text()
		});
		})
	}
	}),
}