// Supabase Edge Function: shiji-ai-classify
// Deploy with verify_jwt=true. Store GROQ_API_KEY as a Supabase Edge Function secret.
// The browser must send its Supabase user access token; never send a provider key to the browser.
import { createClient } from "npm:@supabase/supabase-js@2";
const headers = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, apikey, content-type, x-client-info","Access-Control-Allow-Methods":"POST, OPTIONS","Content-Type":"application/json"};
const respond=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
const categories=["学习教育","美食烹饪","旅行攻略","健身运动","摄影设计","科技数码","穿搭美妆","生活家居","娱乐影视","商业职场","待整理"];
Deno.serve(async request=>{
  if(request.method==="OPTIONS")return new Response(null,{status:204,headers});
  if(request.method!=="POST")return respond({error:"Method not allowed"},405);
  const supabaseUrl=Deno.env.get("SUPABASE_URL"),anon=Deno.env.get("SUPABASE_ANON_KEY"),groqKey=Deno.env.get("GROQ_API_KEY");
  if(!supabaseUrl||!anon||!groqKey)return respond({error:"AI 服务尚未配置，请管理员设置 GROQ_API_KEY"},503);
  const token=request.headers.get("Authorization")?.replace(/^Bearer\s+/i,"");
  if(!token)return respond({error:"请先登录拾集账户"},401);
  const sb=createClient(supabaseUrl,anon,{global:{headers:{Authorization:"Bearer "+token}},auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user},error:authError}=await sb.auth.getUser(token);
  if(authError||!user)return respond({error:"登录凭证失效，请重新登录"},401);
  let input:unknown;try{input=await request.json()}catch{return respond({error:"请求不是有效 JSON"},400)}
  const entries=(input as {items?:unknown})?.items;
  if(!Array.isArray(entries)||entries.length===0||entries.length>12)return respond({error:"一次只允许分类 1–12 条"},400);
  const items=entries.map((x:unknown)=>({id:String((x as any)?.id??"").slice(0,80),title:String((x as any)?.title??"").slice(0,250),url:String((x as any)?.url??"").slice(0,1000)}));
  if(items.some(x=>!x.id||!x.title))return respond({error:"缺少收藏 ID 或标题"},400);
  // Verify ownership and use trusted saved titles, not arbitrary client-supplied text.
  const {data:owned,error:dbErr}=await sb.from("bookmarks").select("id,title,url,category").eq("user_id",user.id).in("id",items.map(x=>x.id));
  if(dbErr)return respond({error:"无法验证收藏数据权限"},500);
  if(!owned||owned.length!==new Set(items.map(x=>x.id)).size)return respond({error:"存在无权限访问的收藏"},403);
  const list=owned.map(x=>({id:x.id,title:String(x.title).slice(0,250)}));
  const prompt="你是视频收藏归类助手。仅根据提供的标题判断主题；信息不足归为待整理。不得推测视频实际内容。为每条生成category和2-5个短关键词tags。category必须是以下之一："+categories.join("、")+"。只输出JSON对象：{results:[{id,category,tags}]}。待分类："+JSON.stringify(list);
  let api:Response;
  try{api=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Authorization":"Bearer "+groqKey,"Content-Type":"application/json"},body:JSON.stringify({model:"openai/gpt-oss-20b",temperature:0,max_completion_tokens:1100,response_format:{type:"json_object"},messages:[{role:"user",content:prompt}]})})}
  catch{return respond({error:"AI 服务网络请求失败"},502)}
  if(!api.ok)return respond({error:api.status===429?"免费模型额度或速率限制已到，稍后再试": "AI 分类服务暂时不可用",providerStatus:api.status},api.status===429?429:502);
  let results:any[];try{const raw=await api.json();const content=raw.choices?.[0]?.message?.content;results=JSON.parse(content).results;if(!Array.isArray(results))throw Error("Invalid JSON")}catch{return respond({error:"模型结果格式不正确"},502)}
  let updated=0;const output:any[]=[];
  for(const row of results){const valid=owned.find(x=>x.id===row.id);if(!valid)continue;const category=categories.includes(row.category)?row.category:"待整理";const tags=Array.isArray(row.tags)?row.tags.filter((v:unknown)=>typeof v==="string").slice(0,5).map((v:string)=>v.slice(0,30)):[];const {error}=await sb.from("bookmarks").update({category}).eq("id",valid.id).eq("user_id",user.id);if(!error){updated++;output.push({id:valid.id,category,tags})}}
  return respond({updated,results:output,method:"title-only-ai"});
});
