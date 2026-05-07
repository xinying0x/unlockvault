"use strict";(()=>{var e={};e.id=5217,e.ids=[5217],e.modules={1785:(e,t,r)=>{r.r(t),r.d(t,{config:()=>m,default:()=>g,routeModule:()=>f});var a={};r.r(a),r.d(a,{default:()=>p});var o=r(3480),n=r(8667),s=r(6435),i=r(9021),l=r.n(i),c=r(3873),u=r.n(c);let d=(e,t)=>{let r="https://unlockvault.xyz",a=new Date().toUTCString(),o=[...e.filter(e=>e.published).map(e=>({...e,type:"article",date:e.createdAt,url:`${r}/articles/${e.slug}`})),...t.map(e=>({...e,type:"offer",date:e.addedAt,url:`${r}/offers/${e.slug}`,summary:e.description,content:e.description}))].sort((e,t)=>new Date(t.date).getTime()-new Date(e.date).getTime()).slice(0,50).map(e=>{let t=new Date(e.date).toUTCString();e.type;let a=e.category?`<category>${e.category}</category>`:"",o=e.summary||e.description||"";return`
    <item>
      <title><![CDATA[${e.title}]]></title>
      <description><![CDATA[${o}]]></description>
      <link>${e.url}</link>
      <guid isPermaLink="true">${e.url}</guid>
      <pubDate>${t}</pubDate>
      ${a}
      <source url="${r}/rss.xml">UnlockVault RSS Feed</source>
      <dc:creator><![CDATA[${e.author||"UnlockVault Team"}]]></dc:creator>
      <content:encoded><![CDATA[
        <img src="${e.image}" alt="${e.title}" style="max-width: 100%; height: auto; margin-bottom: 1rem;" />
        <p>${o}</p>
        ${"article"===e.type?`<p><strong>Category:</strong> ${e.category}</p>`:""}
        ${"offer"===e.type?`<p><strong>Type:</strong> ${e.type.charAt(0).toUpperCase()+e.type.slice(1)}</p>`:""}
        <p><a href="${e.url}" target="_blank">Read more on UnlockVault</a></p>
      ]]></content:encoded>
    </item>`}).join("");return`<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" 
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>UnlockVault - Premium Software &amp; Digital Tools</title>
    <description>Discover premium software, games, applications, and digital tools. Get access to professional software, latest games, productivity apps, and development tools.</description>
    <link>${r}</link>
    <language>en-us</language>
    <lastBuildDate>${a}</lastBuildDate>
    <pubDate>${a}</pubDate>
    <ttl>60</ttl>
    <image>
      <url>${r}/logo.svg</url>
      <title>UnlockVault</title>
      <link>${r}</link>
      <width>144</width>
      <height>144</height>
    </image>
    <atom:link href="${r}/rss.xml" rel="self" type="application/rss+xml" />
    <managingEditor>support@unlockvault.xyz (UnlockVault Team)</managingEditor>
    <webMaster>support@unlockvault.xyz (UnlockVault Team)</webMaster>
    <category>Technology</category>
    <category>Software</category>
    <category>Gaming</category>
    <category>Productivity</category>
    <generator>UnlockVault RSS Generator</generator>
    <docs>https://validator.w3.org/feed/docs/rss2.html</docs>
    <copyright>\xa9 2024 UnlockVault. All rights reserved.</copyright>
    ${o}
  </channel>
</rss>`};async function p(e,t){if("GET"!==e.method)return t.status(405).json({message:"Method not allowed"});try{let e=[],r=[];try{let t=[u().join("/tmp","unlockvault","articles.json"),u().join(process.cwd(),"data","articles.json")],r=t.find(e=>l().existsSync(e))||t[1];if(l().existsSync(r)){let t=l().readFileSync(r,"utf8");e=JSON.parse(t)}}catch(e){console.log("Could not read articles data:",e)}try{let e=[u().join("/tmp","unlockvault","offers.json"),u().join(process.cwd(),"data","offers.json")],t=e.find(e=>l().existsSync(e))||e[1];if(l().existsSync(t)){let e=l().readFileSync(t,"utf8");r=JSON.parse(e)}}catch(e){console.log("Could not read offers data:",e)}let a=d(e,r);t.setHeader("Content-Type","application/rss+xml; charset=utf-8"),t.setHeader("Cache-Control","public, max-age=3600"),t.status(200).send(a)}catch(e){console.error("Error generating RSS feed:",e),t.status(500).json({message:"Error generating RSS feed"})}}let g=(0,s.M)(a,"default"),m=(0,s.M)(a,"config"),f=new o.PagesAPIRouteModule({definition:{kind:n.A.PAGES_API,page:"/api/rss",pathname:"/api/rss",bundlePath:"",filename:""},userland:a})},3480:(e,t,r)=>{e.exports=r(5600)},3873:e=>{e.exports=require("path")},5600:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},6435:(e,t)=>{Object.defineProperty(t,"M",{enumerable:!0,get:function(){return function e(t,r){return r in t?t[r]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,r)):"function"==typeof t&&"default"===r?t:void 0}}})},8667:(e,t)=>{Object.defineProperty(t,"A",{enumerable:!0,get:function(){return r}});var r=function(e){return e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE",e.IMAGE="IMAGE",e}({})},9021:e=>{e.exports=require("fs")}};var t=require("../../webpack-api-runtime.js");t.C(e);var r=t(t.s=1785);module.exports=r})();