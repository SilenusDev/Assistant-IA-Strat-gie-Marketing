<%!
    import re
%>
<%def name="render_python_code(code)">
<%
    indent = ' ' * 4
    code = code.rstrip()
    return re.sub(r'(?m)^', indent, code)
%>
${render_python_code(code)}
</%def>
