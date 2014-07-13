/*
 * @author : wangzhonghua
 * @time : 2014.7.5
 * @description: html转ubb，富文本提交时，需要经此处理
 * @example：
		$.html2ubb('<a href="http://www.baidu.com">http://www.baidu.com</a>') => [url]http://www.baidu.com[/url]
		$.html2ubb('<span class="edit_font_color">content</span>') => [red]content[/red]
		$.html2ubb('<span class="edit_font_normal">content</span>') => [normal]content[/normal]
		$.html2ubb('<strong>content</strong>') => [b]content[/b]
		$.html2ubb('<img src="http://imgsrc.baidu.com/forum/w%3D580/sign=793a009cd8b44aed594ebeec831d876a/78b5c9ea15ce36d32a1b80e638f33a87e850b1cd.jpg" class="BDE_Image" width="640" height="500" pic_type="*">') => [img pic_type=* width=640 height=500]http://imgsrc.baidu.com/forum/w%3D580/sign=793a009cd8b44aed594ebeec831d876a/78b5c9ea15ce36d32a1b80e638f33a87e850b1cd.jpg[img]
		$.html2ubb('<img pic_type="1" class="BDE_Smiley" src="http://tb2.bdstatic.com/tb/editor/images/qw_cat_small/qw_cat_0005.gif" height="200" width="200">') => [emotion pic_type=1 width=200 height=200]http://tb2.bdstatic.com/tb/editor/images/qw_cat_small/qw_cat_0005.gif[emotion]
		$.html2ubb('<embed allowfullscreen="true" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" wmode="transparent" play="true" loop="false" menu="false" allowscriptaccess="never" scale="noborder" src="http://box.baidu.com/widget/flash/bdspacesong.swf?from=tieba&amp;url=&amp;name=&amp;artist=&amp;song_id=116290825&amp;extra=&amp;autoPlay=false&amp;loop=true" class="BDE_Music" width="400" height="95"/>') => [music width=400 height=95]http://box.baidu.com/widget/flash/bdspacesong.swf?from=tieba&url=&name=&artist=&song_id=116290825&extra=&autoPlay=false&loop=true[/music]
		$.html2ubb('<embed allowfullscreen="true" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" wmode="transparent" play="true" loop="false" menu="false" allowscriptaccess="never" scale="noborder" src="http://player.youku.com/player.php/sid/XNzIyMzQ4Mzgw/v.swf" class="BDE_Flash" width="500" height="450" vsrc="http://v.youku.com/v_show/id_XNzIyMzQ4Mzgw.html" vpic="http://g4.ykimg.com/01270F1F4653913B7A7A0F00000000689D6E82-9742-AFF8-73EC-60B0F900AC7D" pkey="c4eb054b59cd7d2cc5d71defc75eac2c"/>') => [video width=500 height=450 vsrc=http://v.youku.com/v_show/id_XNzIyMzQ4Mzgw.html vpic=http://g4.ykimg.com/01270F1F4653913B7A7A0F00000000689D6E82-9742-AFF8-73EC-60B0F900AC7D pkey=c4eb054b59cd7d2cc5d71defc75eac2c]http://player.youku.com/player.php/sid/XNzIyMzQ4Mzgw/v.swf[/video]
		$.html2ubb('<br/>') => [br]
		$.html2ubb('[') => [lbk]
		$.html2ubb(']') => [rbk]
 
 */		
(function($, undefined){
	//html转义
	function escapeHTML(str) {
            return str.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\s/g, '&nbsp;')
                .replace(/"/g, "&quot;");
    };
	//替换文本中的"["和"]"
	function replaceBracket(text){
		return (text.replace(/(\[)|(\])/g, function(replacement){
			return (replacement == '['? '[lbk]': ( replacement == ']'? '[rbk]': ''))
		}));
	}
	function node2ubb(node){
		var ubb = "";
		switch (node.nodeName.toLowerCase()){
			case 'a':
				ubb = a2ubb(node);
				break;
			case 'img':
				ubb = img2ubb(node);
				break;
			case 'embed':
				ubb = embed2ubb(node);
				break;
			case 'span':
				ubb = span2ubb(node);
				break;
			case 'strong':
				ubb = strong2ubb(node);
				break;
			case 'br':
				ubb = br2ubb();
				break;
			default:
				ubb = text2ubb(node);
		}
		return ubb;
	}

	function a2ubb(node){
		return (node.href? '[url]' + node.href + '[/url]': '');
	}

	function img2ubb(node){
		var ubb_head = '', ubb_foot = '';
		var ubb_body = ' pic_type=' + node.getAttribute('pic_type') + ' width=' + node.width + ' height=' + node.height + ']' + node.src;
		
		switch (node.className){
			case 'BDE_Image':
				ubb_head = '[img';
				ubb_foot = '[/img]';
				break;
			case 'BDE_Smiley':
				ubb_head = '[emotion';
				ubb_foot = '[/emotion]';
		}
		return  (ubb_head + ubb_body + ubb_foot);
	}

	function embed2ubb(node){
		var ubb = '';
		switch (node.className){
			case 'BDE_Music':
				ubb = '[music width=' + node.width + ' height=' + node.height + ']' + node.src  +'[/music]';
				break;
			case 'BDE_Flash':
				ubb = '[video width=' + node.width + ' height=' + node.height + ' vsrc=' + node.getAttribute('vsrc') + ' vpic=' + node.getAttribute('vpic') + ' pkey=' + node.getAttribute('pkey') + ']' + node.src  +'[/video]';
		}
		return  ubb;
	}

	function span2ubb(node){
		var ubb = '';
		$.each(node.childNodes, function(index, subNode){
			ubb += node2ubb(subNode);
		});
		switch (node.className){
			case 'edit_font_color':
				ubb = ubb? '[red]' + ubb + '[/red]': '';
				break;
			case 'edit_font_normal':
				ubb = ubb? '[normal]' + ubb + '[/normal]': '';
		}
		return ubb;
	}
	function strong2ubb(node){
		var ubb = '';
		$.each(node.childNodes, function(index,subNode){
			ubb += node2ubb(subNode);
		});
		return (ubb? '[b]' + ubb + '[/b]': '');
	}
	function br2ubb(){
		return '[br]';
	}
	function text2ubb(node){
		//htmlparse会把已转义的html解析成html文本，所以此时要反转回去
		return escapeHTML(node.nodeValue);
	}
	
	$.html2ubb = function(str){
		var ubb = '';
		var parse =	$.parseHTML(replaceBracket(str));
		$.each(parse||[], function(index, node){
			ubb += node2ubb(node);
		});
		return ubb;
	}
}($));
