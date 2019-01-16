function z=codify_string(x,y)
n=numel(y);
for i=1:n
    if strcmp(x,y(i))
        z=i;return
    end
end
error('value %s unknown',x)
end