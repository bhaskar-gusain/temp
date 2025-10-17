const fs = require("fs");
const { parse } = require("@typescript-eslint/typescript-estree");



// 1️⃣ Read TypeScript input
const tsCode = fs.readFileSync("main.ts", "utf-8");

// 2️⃣ Parse TypeScript into AST
const tree = parse(tsCode, { loc: true, range: true });

// 3️⃣ Shim map (TS → C++)
const shims = {
	"basic.showAkhila": "basic::showAkhila",
	"basic.showString": "basic::showString",
	"basic.showNumber": "basic::showNumber",
	"led.on": "led::on",


	// Math mappings
	"Math.sqrt": "sqrt",
	"Math.pow": "pow",
	"Math.abs": "abs",
	"Math.floor": "floor",
	"Math.ceil": "ceil",
	"Math.round": "round",
	"Math.sin": "sin",
	"Math.cos": "cos",
	"Math.tan": "tan",
	"Math.asin": "asin",
	"Math.acos": "acos",
	"Math.atan2": "atan2",
};
// Detect array type from its elements
function detectArrayType(node) {
	if (!node.elements || node.elements.length === 0) return "auto";
	const first = node.elements[0];
	if (first.type === "Literal") {
		const val = first.value;
		if (typeof val === "number") return "int";
		if (typeof val === "string") return "std::string";
		if (typeof val === "boolean") return "bool";
	}
	return "auto";
}

function emitNoSemicolon(node) {
	let out = emit(node);
	if (out.endsWith(";")) out = out.slice(0, -1);
	return out;
}


// 4️⃣ Simple recursive emitter
function emit(node) {
	switch (node.type) {
		case "Program":
			return node.body.map(emit).join("\n");

		case "ExpressionStatement":
			return emit(node.expression) + ";";

		case "CallExpression":{

			const calleeNode = node.callee;
			const args = node.arguments.map(emit).join(", ");

			if (calleeNode.type === "MemberExpression") {
				const obj = emit(calleeNode.object);
				const method = calleeNode.property.name;

				if (method === "splice") {
					// TS: list.splice(start, count) => C++: list.erase(list.begin() + start, list.begin() + start + count)
					const start = emit(node.arguments[0]);
					const count = emit(node.arguments[1] || { type: "Literal", value: 1 });
					return `${obj}.erase(${obj}.begin() + ${start}, ${obj}.begin() + ${start} + ${count});`;
				}

				// previous array method calls
				if (method === "push") return `${obj}.push_back(${args});`;
				if (method === "pop") return `${obj}.pop_back();`;
				if (method === "shift") return `${obj}.erase(${obj}.begin());`;
				if (method === "reverse") return `std::reverse(${obj}.begin(), ${obj}.end());`;
			}

			// basic.showString / showNumber
			const callee = emit(calleeNode);
			if (callee === "basic.showString") return `basic::showString(${args});`;
			if (callee === "basic.showNumber") return `basic::showNumber(${args});`;

			// math functions
			const mathMap = {
				"Math.sin":"sin","Math.cos":"cos","Math.tan":"tan",
				"Math.asin":"asin","Math.acos":"acos","Math.atan2":"atan2",
				"Math.sqrt":"sqrt","Math.pow":"pow","Math.abs":"abs"
			};
			if (mathMap[callee]) return `${mathMap[callee]}(${args})`;

			return `${callee}(${args})`;
		}

		case "MemberExpression": {
			const obj = emit(node.object);   // variable name
			const prop = node.property.name;

			// Array element access: list[0]
			if (node.computed) {
				// e.g., list[index] -> list[index]
				const index = emit(node.property);
				return `${obj}[${index}]`;
			}

			// Array/string methods
			switch (prop) {
				case "length": return `${obj}.size()`;
				case "push":   return `${obj}.push_back`;
				case "pop":    return `${obj}.pop_back()`;
				case "shift":  return `${obj}.erase(${obj}.begin())`;
				case "splice": return `${obj}.erase`; // handle in CallExpression
				case "reverse": return `std::reverse(${obj}.begin(), ${obj}.end())`;
				case "concat": return `${obj}`; // handle separately
				case "join": return `${obj}`;   // handle separately
				default:
					const tsCall = `${obj}.${prop}`;
					const mapped = shims[tsCall];
					if (mapped) return mapped;
					return `${obj}::${prop}`;
			}	
		}


		case "Literal":
			if (typeof node.value === "string") return `"${node.value}"`;
			return String(node.value);

		case "IfStatement":
			return `if (${emit(node.test)}) {\n${emit(node.consequent)}\n}` +
				(node.alternate ? ` else {\n${emit(node.alternate)}\n}` : "");

		case "BlockStatement":
			return node.body.map(emit).join("\n");

			// 🟢 Arithmetic, logic, comparison
		case "BinaryExpression":
		case "LogicalExpression":
			return `${emit(node.left)} ${node.operator} ${emit(node.right)}`;

		case "UnaryExpression":
			return `${node.operator}${emit(node.argument)}`;

		case "Identifier":
			return node.name;

			// 🟢 Assignment
		case "AssignmentExpression":
			return `${emit(node.left)} ${node.operator} ${emit(node.right)}`;


			// 🟢 Handle VariableDeclaration (for loop init)
		case "VariableDeclaration":
			return node.declarations.map(emit).join(", ");

		case "VariableDeclarator":{
			const id = emit(node.id);
			if (!node.init) return `auto ${id}`;
			const init = emit(node.init);

			// Handle array literal
			if (node.init.type === "ArrayExpression") {
				const type = detectArrayType(node.init);
				return `std::vector<${type}> ${id} = ${init};`;
			}

			// Handle string literal
			if (node.init.type === "Literal" && typeof node.init.value === "string") {
				return `std::string ${id} = ${init}`;
			}

			// Default numeric
			return `auto ${id} = ${init};`;
		}

			// 🟢 Handle ForStatement
		case "ForStatement": {
			const init = node.init ? emitNoSemicolon(node.init) : "";
			const test = node.test ? emit(node.test) : "";
			const update = node.update ? emit(node.update) : "";
			const body = emit(node.body);
			return `for (${init}; ${test}; ${update}) {\n${body}\n}`;
		}

		case "WhileStatement": {
			const test = emit(node.test);
			const body = emit(node.body);
			return `while (${test}) {\n${body}\n}`;
		}

		case "IfStatement":
			return (
				`if (${emit(node.test)}) {\n${emit(node.consequent)}\n}` +
				(node.alternate ? ` else {\n${emit(node.alternate)}\n}` : "")
			);

		case "UpdateExpression": {
			const arg = emit(node.argument);
			return node.prefix
			? `${node.operator}${arg}`
			: `${arg}${node.operator}`;
		}

			// ---- Array literal ----
		case "ArrayExpression":
			return `{ ${node.elements.map(emit).join(", ")} }`;

			// ---- Function definitions ----
		case "FunctionDeclaration": {
			const name = emit(node.id);
			const params = node.params.map(emit).join(", ");
			const body = emit(node.body);
			return `void ${name}(${params}) {\n${body}\n}`;
		}

		case "ReturnStatement":
			return `return ${emit(node.argument)};`;

		case "Parameter":
			return `auto ${emit(node.name || node)}`;

		default:
			return "";
	}
}

// 5️⃣ Emit C++
const cppBody = emit(tree);
const cpp = `#include "basic.cpp"\nint main() {\n${cppBody}\nreturn 0;\n}`;
fs.writeFileSync("main.cpp", cpp);
console.log("✅ Generated main.cpp");

