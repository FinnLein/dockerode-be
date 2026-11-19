const completeScript = `if redis.call("get", KEYS[1]) == ARGV[1] then 
	return redis.call("set", KEYS[1], "done", "EX", ARGV[2])
end
return 0`;

export { completeScript };
